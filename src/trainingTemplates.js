// Built-in training templates a user can start from instead of building a
// training from scratch (see AddCategoryModal). Each template's fields()/
// steps() return freshly-id'd objects on every call, so using the same
// template for multiple dogs (or re-adding one that was deleted) never
// produces id collisions.

function templateField(label, type, unit) {
  return { id: uid(), label, type, unit: unit || "" };
}

function templateStep(label, taskLabels) {
  return { id: uid(), label, tasks: taskLabels.map((t) => ({ id: uid(), label: t })) };
}

const TRAINING_TEMPLATES = [
  {
    id: "relaxation-protocol",
    icon: "🧘",
    name: "Relaxation Protocol",
    source: "Adapted from Dr. Karen Overall's approach",
    description:
      "A 15-day program of short sit/down-stays where you gradually add movement, distance, sounds, and visitors. Pick the day you're working on and check off each task as you go. This is a simplified, adapted version — look up the original for the full clinical protocol.",
    fields: () => [templateField("Session length", "number", "min"), templateField("How relaxed?", "scale")],
    steps: () => [
      templateStep("Day 1 — Foundation", [
        "Sit/down-stay: take 1 step back, return, reward",
        "Sit/down-stay: take 1 step to the side, return, reward",
        "Sit/down-stay: take 1 step to the other side, return, reward",
        "Sit/down-stay: count to 3, return, reward",
        "Sit/down-stay: clap hands once, return, reward",
        "Sit/down-stay: turn your back for 3 sec, return, reward",
        "Sit/down-stay: jump or bounce once in place, return, reward",
        "Sit/down-stay: count to 5, return, reward",
      ]),
      templateStep("Day 2 — A little more", [
        "Sit/down-stay: take 2 steps back, return, reward",
        "Sit/down-stay: take 3 steps back, return, reward",
        "Sit/down-stay: step out of sight for 3 sec, return, reward",
        "Sit/down-stay: clap hands twice, return, reward",
        "Sit/down-stay: jog in place for 3 sec, return, reward",
        "Sit/down-stay: count to 10, return, reward",
        "Sit/down-stay: walk all the way around the dog, return, reward",
        "Sit/down-stay: touch the door handle, return, reward",
      ]),
      templateStep("Day 3 — Building duration", [
        "Sit/down-stay: count to 15, return, reward",
        "Sit/down-stay: take 5 steps back, return, reward",
        "Sit/down-stay: step out of sight for 5 sec, return, reward",
        "Sit/down-stay: open/close a cupboard nearby, return, reward",
        "Sit/down-stay: sit in a chair for 5 sec, return, reward",
        "Sit/down-stay: count to 20, return, reward",
      ]),
      templateStep("Day 4 — Distance and disappearing", [
        "Sit/down-stay: step out of sight for 8 sec, return, reward",
        "Sit/down-stay: step out of sight for 10 sec, return, reward",
        "Sit/down-stay: walk to the door and back, return, reward",
        "Sit/down-stay: walk around the dog twice, return, reward",
        "Sit/down-stay: count to 25, return, reward",
        "Sit/down-stay: knock softly or ring a bell, return, reward",
      ]),
      templateStep("Day 5 — Everyday sounds", [
        "Sit/down-stay: drop a small object nearby, return, reward",
        "Sit/down-stay: clap hands 3 times, return, reward",
        "Sit/down-stay: knock on a wall or table, return, reward",
        "Sit/down-stay: jog in place for 5 sec, return, reward",
        "Sit/down-stay: step out of sight for 15 sec, return, reward",
        "Sit/down-stay: count to 30, return, reward",
      ]),
      templateStep("Day 6 — Movement around the room", [
        "Sit/down-stay: walk to the door, touch it, return, reward",
        "Sit/down-stay: open the door partway, close it, return, reward",
        "Sit/down-stay: jog a full circle around the dog, return, reward",
        "Sit/down-stay: sit in a chair for 15 sec, return, reward",
        "Sit/down-stay: count to 30 while moving slightly, reward",
      ]),
      templateStep("Day 7 — Review and consolidate", [
        "Repeat 3 favorite exercises from days 1–6, back to back",
        "Sit/down-stay: step out of sight for 20 sec, return, reward",
        "Sit/down-stay: walk out of the room and back in, reward",
        "Sit/down-stay: count to 40, return, reward",
        "Sit/down-stay: sit and read aloud for 20 sec, return, reward",
      ]),
      templateStep("Day 8 — Everyday distractions", [
        "Sit/down-stay: open the fridge or a cupboard, return, reward",
        "Sit/down-stay: drop keys or a spoon nearby, return, reward",
        "Sit/down-stay: step out of sight for 25 sec, return, reward",
        "Sit/down-stay: jog in place for 10 sec, return, reward",
        "Sit/down-stay: knock on the door, return, reward",
        "Sit/down-stay: count to 45, return, reward",
        "Sit/down-stay: run the vacuum briefly nearby, return, reward",
      ]),
      templateStep("Day 9 — People at the door", [
        "Sit/down-stay: knock on the door twice, return, reward",
        "Sit/down-stay: ring the doorbell, return, reward",
        "Sit/down-stay: open and close the front door, return, reward",
        "Sit/down-stay: step outside briefly and back in, reward",
        "Sit/down-stay: count to 45 while doing light housework, reward",
      ]),
      templateStep("Day 10 — A visitor helps", [
        "Sit/down-stay: a visitor knocks and enters, return, reward",
        "Sit/down-stay: a visitor walks past at a distance, return, reward",
        "Sit/down-stay: a visitor talks to you for 10 sec, return, reward",
        "Sit/down-stay: count to 60, return, reward",
        "Sit/down-stay: step out of sight for 30 sec, return, reward",
      ]),
      templateStep("Day 11 — Food distractions", [
        "Sit/down-stay: eat a small snack yourself, return, reward",
        "Sit/down-stay: pick a treat up off the floor, return, reward",
        "Sit/down-stay: drop food and pick it back up, return, reward",
        "Sit/down-stay: count to 60 while preparing food nearby, reward",
        "Sit/down-stay: step out of sight for 40 sec, return, reward",
      ]),
      templateStep("Day 12 — Longer stretches", [
        "Sit/down-stay: count to 90, return, reward",
        "Sit/down-stay: step out of sight for 1 min, return, reward",
        "Sit/down-stay: fold laundry nearby for 1 min, reward",
        "Sit/down-stay: a visitor sits and chats for 1 min, reward",
      ]),
      templateStep("Day 13 — Public-style distractions", [
        "Sit/down-stay: walk past with a rolling bag or vacuum, return, reward",
        "Sit/down-stay: bounce a ball nearby a few times, return, reward",
        "Sit/down-stay: two people talk and move around for 1 min, reward",
        "Sit/down-stay: count to 90 with a quiet background noise/recording, reward",
      ]),
      templateStep("Day 14 — Real-life run-through", [
        "Sit/down-stay: run through a normal routine (door, phone, cooking) for 2 min, reward",
        "Sit/down-stay: step out of sight for 90 sec, return, reward",
        "Sit/down-stay: a visitor comes in and stays for 2 min, reward",
      ]),
      templateStep("Day 15 — Graduation", [
        "Sit/down-stay: hold a calm settle for 3 min with normal activity around, reward",
        "Sit/down-stay: step out of sight for 2 min, return, reward",
        "Sit/down-stay: a visitor arrives and chats for 3 min, reward",
        "Repeat the whole session in a new room or location",
      ]),
    ],
  },
  {
    id: "settle-on-a-mat",
    icon: "🟫",
    name: "Settle on a mat",
    source: null,
    description:
      "Teach the dog that a mat or bed is a cue to lie down and relax — useful for mealtimes, visitors, or out in public.",
    fields: () => [templateField("Duration", "number", "min"), templateField("Distractions handled", "scale")],
    steps: () => [
      templateStep("Step 1 — Notice the mat", ["Mark and reward any look at, sniff, or step toward the mat"]),
      templateStep("Step 2 — Get on the mat", ["Reward all four feet on the mat"]),
      templateStep("Step 3 — Sit or down on the mat", ["Reward a sit or down on the mat"]),
      templateStep("Step 4 — Add duration", [
        "Reward for staying on the mat a few seconds",
        "Gradually stretch the wait before rewarding",
      ]),
      templateStep("Step 5 — Add distance", [
        "Take one step away, return, reward on the mat",
        "Take several steps away, return, reward on the mat",
      ]),
      templateStep("Step 6 — Add distractions", [
        "Practice with a toy or object moving nearby",
        "Practice with another person walking around",
      ]),
      templateStep("Step 7 — Take it on the road", [
        "Practice a mat settle in a new room",
        "Practice a mat settle somewhere out of the house (café, park bench, vet waiting room)",
      ]),
    ],
  },
];
