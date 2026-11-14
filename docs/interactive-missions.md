# Interactive missions

## Where to find them

- Everyday words and useful messages, activity3: Tool workshop. Move a spoon, paintbrush, key or watering can to a job; the soup mixes, picture appears, lock opens or plant is watered. Two tool choices keep the first board quiet.
- The same course, activity9: In, on or beside? Move a ball/block into a spatial relationship, with an optional visual model and adult-read instructions. The completed picture uses actual contact and occlusion.
- Read a message, make it happen, activity11: The parcel road. Read a two-line plan with adult support, load at the depot, drive along connected roads and unload at the recipient. Delivered pictures stay with the recipients and earlier deliveries are retained.

Every game has four challenges and a clear course destination. Tap/select-place, keyboard buttons and Pointer Events drag descriptors call the same state transitions. No speed, speech production, tracing or independent reading judgement is required. Adult modelling and usual AAC remain welcome.

## Implementation

`studio-missions-core.js` contains deterministic data and state transitions. `studio-missions.js` owns rendering, lifecycle, input binding, feedback and progression. An ES module entry point is in `studio-modules/missions.mjs`. Game state is disposed on navigation; input descriptors capture session/revision and delayed transitions capture round/revision. Invalid actions preserve completed work. The existing teaching/parent content sits below the game.

The courses remain16 placements each; three offline placements became interactive. The pilot mix is29 interactive placements and19 shared offline activities. These are three new game systems, not three new courses. Existing shared practice is not retroactively marked as completion of the new interactive content.

## Verification limits

Automated tests cover48 round completions across input descriptors and pacing modes, retries, parcel retention, road connectivity, pause, navigation, stale events, progress and contact geometry. Sixteen scene states were rasterised and statically reviewed. Browser layout, real keyboard focus and physical-device drag gestures still require the supported browser/device workflow.
