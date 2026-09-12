"use client";

import {useState} from "react";
import TrackMap from "./ClientTrackMap";
import PlayerRun from "./PlayerRun";
import type {Point, Track} from "@/lib/types";
import type {RaceState} from "@/lib/racing";

export default function TrackExperience({track}:{track:Track}) {
  const [location, setLocation] = useState<Point>();
  const [race, setRace] = useState<RaceState>({phase: "ready", nextCheckpoint: 0, sequence: []});
  return <><TrackMap route={track.route} start={track.startGate} checkpoints={track.checkpoints} currentLocation={location} completedCheckpoints={race.nextCheckpoint} checkpointEntered={race.checkpointEntered}/><PlayerRun track={track} onPositionChange={setLocation} onRaceStateChange={setRace}/></>;
}
