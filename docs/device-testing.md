# Testing on real devices

Everything in the automated suites runs in emulated Chromium. That catches a lot, but it cannot tell how the app feels under a finger, with a real screen reader, or on Safari. This checklist takes about an afternoon with three devices.

## Devices
- An iPad (Safari), ideally also in a guided-access / kiosk setting used at school.
- An Android tablet or phone (Chrome).
- A small phone (iPhone SE/mini size or a small Android phone).
- If available: a switch interface that sends Space/Enter, and an eye-gaze or head-pointer setup.

Open the deployed site (or `npm run build` and serve `build/` over HTTPS on the local network).

## 1. First visit
- [ ] The home loads quickly on mobile data; nothing overlaps the bottom navigation.
- [ ] "Not sure where to start?" → answer three questions → sensible suggestions appear.
- [ ] Add to Home Screen works; the icon and name look right; it opens full screen.

## 2. Playing (repeat on each device)
Pick: *Find my twin* (Notice what belongs together), *Hear It, Find It* (Every way to answer), *Here Around Me* (Find a comfortable pause), *Labels for a mixed-up shop* (Read short words), *Duck's Canal Rescue* and *The Anywhere Adventure Bus*.
- [ ] The pictures to choose from are visible without scrolling (portrait and landscape).
- [ ] Tapping a picture selects it on the first tap; no accidental double-selection.
- [ ] Dragging works smoothly with a finger: the object lifts, targets show a dashed outline, it snaps in.
- [ ] Tap-then-tap placement works as an alternative to dragging.
- [ ] Wrong answer: the picture fades with ↻; right answer: ✓, pop and stars (none with Reduce movement).
- [ ] "Show me how" points at the right thing and the hand animation is visible.
- [ ] The canal: unloading Duck and the parcel at the landing works by tapping the landing.
- [ ] Nothing scrolls the page sideways; pinch-zoom is still possible.

## 3. Settings
- [ ] Text size Large and Larger: nothing is cut off; games still fit or scroll sensibly.
- [ ] High contrast and Dark: text readable; picture cards stay light.
- [ ] Sound on: tap / right / try again / finish sounds play, volume works, silent switch respected (iPad).
- [ ] Child mode: menus hidden; holding the lock for 2 seconds leaves it; a quick tap does not.
- [ ] Visit goal 3: after three activities "That's today's visit" appears.
- [ ] Slovenščina: menus, course bar and visit screen switch language.

## 4. Switch and dwell access
- [ ] One switch (automatic scanning): highlight moves through the game's buttons at the chosen speed; the switch selects.
- [ ] Two switches: Space moves, Enter selects.
- [ ] Dwell: holding the pointer still selects after the chosen time; moving away cancels.

## 5. Screen readers
VoiceOver (iPad), TalkBack (Android), NVDA or JAWS (Windows):
- [ ] Every picture choice is announced with a name and its pressed state.
- [ ] After a round changes, focus lands somewhere sensible (the heading or the first choice), not at the top of the page.
- [ ] Feedback ("Well done", "Let's try another picture") is announced.
- [ ] The course bar controls (Pause, Finish for now, Continue automatically) are reachable and labelled.

## 6. Offline
- [ ] Load the app once online, open one course, then switch on airplane mode.
- [ ] Reload: the app opens; courses and games work; word pictures seen before still show.

## Recording results
Note device, OS/browser version, the step, what happened and a screenshot. Problems with touch, layout or announcements are the most valuable findings: none of them can be caught by the automated suites.
