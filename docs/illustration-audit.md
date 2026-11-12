# Illustration audit and corrections

The complete standalone vocabulary library and every shared activity illustration family were reviewed for depicted meaning, surface contact, anatomy, connected parts, clipping and occlusion. Examples included the ball floating above the chair seat and overlong reaching arms.

## Corrections

- Position scenes use reference-specific surfaces: objects touch chair seats and box tops, fit underneath, and sit behind the correct occluding reference. The cardboard box has a separate low stand. Tall animal drawings retain their native viewBox in all four generic placement helpers.
- Shared animal action/role scenes put props within natural reach and use shorter arms. Sleeping and sitting supports remain visible. The movement illustrations now use consistent two-segment arm lengths across all eight poses, with rounded elbows and clothed torsos.
- Story/world artwork corrects umbrella position, washing reaches and layering, bird/nest contact, bucket orientation, puzzle-piece grip, vase stems, drumsticks, stage occlusion, coat fit and boat contact. Learning routines and playroom scenes correct tool contact, flower/soil contact, beads on strings, supported picnic guests and held picnic props.
- Reading and direct-object worlds correct the tapping reach, drum/table contact, workshop floor, forest trunks, pump/lever mounts, flag/watering-can support and pop-up puppet occlusion. Interaction coordinates and gameplay logic were preserved.
- Twelve standalone vocabulary drawings were corrected: toy, coin, toy-car, spring-rider, scooter, wheelbarrow, sled, boat, mailbox, tripod, dental-chair and tooth-model. Their source recipes, generated SVGs and revisioned catalogue entries are updated.
- Striped visual discrimination pictures now clip their patterns to their silhouettes.

## Review coverage

Manual review covered all **1,136 canonical vocabulary objects**, including three catalogue objects supplied through nonstandard source assignments; the recipe review also included 25 noncatalogue aliases. Other manual sheets covered 275 shared actor/position/role/attribute cases, 288 canonical world story states plus shared character-pose and seed/rain matrices, 121 reading/mission configurations, 153 legacy-icon/visual geometry families and all 16 seated/standing movement illustrations. The world review also included 60 routine frames, 80 story frames, eight location compositions, playroom families/states and 12 picnic combinations.

The automated inventory enumerates **34,205 picture uses** and **11,790 distinct SVG outputs**, including all **9,216 world story/step/character/scenery combinations**. It checks named-icon resolution, local image references, valid values, and all 1,136 distinct vocabulary geometries. Every distinct SVG was parsed and rasterised; image-backed SVG wrappers were expanded from their actual local assets. Canonical vocabulary ink was also checked against the canvas bounds. All 11,790 rendered without invalid or blank results.

Independent raster checks cover **287 geometry/contact assertions** across 219 cases, including seat/top contact, underneath clearance, natural action-arm spans, supported sleeping/sitting, and pillow/duvet overlap across all 96 world sleeper/scenery combinations. Node tests also protect consistent movement arm lengths and native animal viewBoxes.

Manual scene review covers canonical templates, poses and state sheets. Combinatorial variants are checked automatically; they were not all individually inspected by eye. This is static artwork and geometry verification. Browser layout, physical dragging/touch, and each child’s recognition are not established by these checks.

## Repeatable checks

`npm run test:art` runs the DOM inventory and contact guards. Export fixtures with `ART_AUDIT_DIR` and `ART_CONTACT_DIR`, then run `python scripts/verify-activity-art.py <fixture-directory>` and `python scripts/verify-art-contacts.py <fixture-directory>`. Raster checks need CairoSVG and Pillow. `APP_DIST` can select another checkout’s dist directory. Reading, purposeful-play and home regression suites remain separate.

The machine-readable coverage and canonical object IDs are in `art/illustration-audit.json`. Audit contact sheets and large intermediate renders are not shipped as website assets.
