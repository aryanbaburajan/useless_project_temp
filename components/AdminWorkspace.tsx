"use client";

import {useEffect, useState} from "react";
import TrackMap from "./ClientTrackMap";
import type {Gate, Point, Track, TrackStatus} from "@/lib/types";

const defaultStart: Gate = {id: "start", label: "Start / finish", lat: 51.505, lng: -0.09};
const blank = (): Track => ({id: "", title: "", description: "", route: [], startGate: defaultStart, checkpoints: [], status: "draft"});

function points(value: unknown): Point[] {
  return Array.isArray(value) ? value.filter((point): point is Point =>
    !!point && typeof point === "object" && Number.isFinite((point as Point).lat) && Number.isFinite((point as Point).lng)
  ) : [];
}

function gates(value: unknown): Gate[] {
  return points(value).map((point, index) => {
    const candidate = point as Partial<Gate>;
    return {lat: point.lat, lng: point.lng, id: candidate.id || `cp-${index + 1}`, label: candidate.label || `Checkpoint ${index + 1}`};
  });
}

function fromRow(row: Record<string, unknown>): Track {
  const start = gates([row.start_gate])[0] || defaultStart;
  return {
    id: typeof row.id === "string" ? row.id : "",
    title: typeof row.title === "string" ? row.title : "",
    description: typeof row.description === "string" ? row.description : "",
    route: points(row.route),
    startGate: {...start, id: "start", label: "Start / finish"},
    checkpoints: gates(row.checkpoints),
    status: row.status === "published" || row.status === "archived" ? row.status : "draft",
    publishedAt: typeof row.published_at === "string" ? row.published_at : undefined,
  };
}

export default function AdminWorkspace() {
  const [track, setTrack] = useState(blank());
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [mode, setMode] = useState<"route" | "start" | "checkpoint">("route");
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/tracks");
    if (!response.ok) return;
    const data = await response.json();
    setList(Array.isArray(data.tracks) ? data.tracks : []);
  };

  useEffect(() => { void load(); }, []);

  const click = (point: Point) => setTrack(current => {
    if (mode === "start") return {...current, startGate: {...current.startGate, lat: point.lat, lng: point.lng}};
    if (mode === "checkpoint") return {...current, checkpoints: [...current.checkpoints, {id: `cp-${Date.now()}`, label: `Checkpoint ${current.checkpoints.length + 1}`, ...point}]};
    return {...current, route: [...current.route, point]};
  });

  const save = async (status: TrackStatus = track.status) => {
    const response = await fetch(track.id ? `/api/admin/tracks/${track.id}` : "/api/admin/tracks", {
      method: track.id ? "PATCH" : "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({...track, status}),
    });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Could not save."); return; }
    setTrack(fromRow(data.track));
    setMessage(status === "published" ? "Published — players can see it now." : "Saved.");
    void load();
  };

  const resetMapPoints = () => {
    setTrack(current => ({...current, route: [], checkpoints: [], startGate: {...defaultStart}}));
    setMode("route");
    setMessage("Map points cleared. Set a new start gate and checkpoints.");
  };

  const newCircuit = () => {
    setTrack(blank());
    setMode("route");
    setMessage("New circuit. Add a title, start gate, and checkpoints.");
  };

  const removeTrack = async () => {
    if (!track.id || !window.confirm(`Delete “${track.title || "this track"}”? Its leaderboard runs will also be removed.`)) return;
    const response = await fetch(`/api/admin/tracks/${track.id}`, {method: "DELETE"});
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Could not delete the track."); return; }
    setTrack(blank());
    setMessage("Track deleted.");
    void load();
  };

  return <main className="shell admin"><header className="row"><div><div className="brand">Creator workspace</div><div className="muted">Developer-created circuits only</div></div><a className="btn secondary" href="/">Player view</a></header><div className="admin-grid" style={{marginTop: 20}}><section className="stack"><button className="btn" onClick={newCircuit}>New circuit</button><label>Title<input className="field" value={track.title} onChange={event => setTrack({...track, title: event.target.value})}/></label><div className="notice">Choose an editing tool, then click the map. Start/finish and one or more checkpoints are required to save.</div><div className="row"><button className={`btn ${mode === "route" ? "" : "secondary"}`} onClick={() => setMode("route")}>Draw route</button><button className={`btn ${mode === "start" ? "" : "secondary"}`} onClick={() => setMode("start")}>Set start</button><button className={`btn ${mode === "checkpoint" ? "" : "secondary"}`} onClick={() => setMode("checkpoint")}>Add checkpoint</button></div><button className="btn secondary" onClick={resetMapPoints}>Reset map points</button><ol className="gate-list">{track.checkpoints.map((gate, index) => <li key={gate.id}>Checkpoint {index + 1} <button className="btn secondary" style={{padding: "3px 7px"}} onClick={() => setTrack({...track, checkpoints: track.checkpoints.filter(item => item.id !== gate.id)})}>remove</button></li>)}</ol><div className="row"><button className="btn secondary" onClick={() => save("draft")}>Save draft</button><button className="btn" onClick={() => save("published")}>Publish</button></div>{track.id && <div className="row"><button className="btn secondary" onClick={() => save("draft")}>Unpublish</button><button className="btn danger" onClick={removeTrack}>Delete track</button></div>}<div className="status">{message || `Status: ${track.status}`}</div><div className="card track-content"><div className="row"><div className="eyebrow">Your circuits</div><span className="muted">Select one to edit</span></div>{list.map(row => <button key={String(row.id)} className="field" style={{textAlign: "left", marginTop: 8}} onClick={() => { setTrack(fromRow(row)); setMessage(`Editing ${String(row.title || "circuit")}.`); }}>{String(row.title || "Untitled circuit")} <span className="muted">— {String(row.status || "draft")}</span></button>)}{!list.length && <p className="muted">No saved circuits.</p>}</div></section><section><TrackMap className="admin-map" route={track.route} start={track.startGate} checkpoints={track.checkpoints} editable onMapClick={click}/></section></div></main>;
}
