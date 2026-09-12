export type Point={lat:number;lng:number};
export type Gate=Point & {id:string;label:string};
export type TrackStatus="draft"|"published"|"archived";
export type Track={id:string;title:string;description:string;coverImageUrl?:string;route:Point[];startGate:Gate;checkpoints:Gate[];status:TrackStatus;publishedAt?:string;createdAt?:string};
export type Run={id?:string;trackId:string;displayName:string;elapsedMs:number;accuracyM:number;maxSpeedMps:number;gateSequence:string[];createdAt?:string};
