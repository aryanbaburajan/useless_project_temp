"use client";

import dynamic from "next/dynamic";

const TrackMap = dynamic(() => import("./TrackMap"), {ssr: false});

export default TrackMap;
