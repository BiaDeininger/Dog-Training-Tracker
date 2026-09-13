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
      "A 15-day settle program that gradually adds distance, sounds, and visitors. Pick your day and check off each task as you go.",
    fields: () => [templateField("Session length", "number", "min"), templateField("How relaxed?", "scale")],
    steps: () => [
      templateStep("Day 1 — Foundation", [
        "Step back 1 step",
        "Step to one side",
        "Step to the other side",
        "Hold for 3 seconds",
        "Clap hands once",
        "Turn your back for 3 seconds",
        "Jump or bounce once in place",
        "Hold for 5 seconds",
      ]),
      templateStep("Day 2 — A little more", [
        "Step back 2 steps",
        "Step back 3 steps",
        "Step out of sight for 3 seconds",
        "Clap hands twice",
        "Jog in place for 3 seconds",
        "Hold for 10 seconds",
        "Walk all the way around",
        "Touch the door handle",
      ]),
      templateStep("Day 3 — Building duration", [
        "Hold for 15 seconds",
        "Step back 5 steps",
        "Step out of sight for 5 seconds",
        "Open and close a cupboard nearby",
        "Sit in a chair for 5 seconds",
        "Hold for 20 seconds",
      ]),
      templateStep("Day 4 — Distance and disappearing", [
        "Step out of sight for 8 seconds",
        "Step out of sight for 10 seconds",
        "Walk to the door and back",
        "Walk all the way around, twice",
        "Hold for 25 seconds",
        "Knock softly or ring a bell",
      ]),
      templateStep("Day 5 — Everyday sounds", [
        "Drop a small object nearby",
        "Clap hands 3 times",
        "Knock on a wall or table",
        "Jog in place for 5 seconds",
        "Step out of sight for 15 seconds",
        "Hold for 30 seconds",
      ]),
      templateStep("Day 6 — Movement around the room", [
        "Walk to the door and touch it",
        "Open the door partway, then close it",
        "Jog a full circle around",
        "Sit in a chair for 15 seconds",
        "Hold for 30 seconds while moving slightly",
      ]),
      templateStep("Day 7 — Review and consolidate", [
        "Repeat 3 favorite exercises from days 1–6, back to back",
        "Step out of sight for 20 seconds",
        "Walk out of the room and back in",
        "Hold for 40 seconds",
        "Read aloud for 20 seconds",
      ]),
      templateStep("Day 8 — Everyday distractions", [
        "Open the fridge or a cupboard",
        "Drop keys or a spoon nearby",
        "Step out of sight for 25 seconds",
        "Jog in place for 10 seconds",
        "Knock on the door",
        "Hold for 45 seconds",
        "Run the vacuum briefly nearby",
      ]),
      templateStep("Day 9 — People at the door", [
        "Knock on the door twice",
        "Ring the doorbell",
        "Open and close the front door",
        "Step outside briefly, then back in",
        "Hold for 45 seconds while doing light housework",
      ]),
      templateStep("Day 10 — A visitor helps", [
        "A visitor knocks and enters",
        "A visitor walks past at a distance",
        "A visitor talks to you for 10 seconds",
        "Hold for 60 seconds",
        "Step out of sight for 30 seconds",
      ]),
      templateStep("Day 11 — Food distractions", [
        "Eat a small snack yourself",
        "Pick a treat up off the floor",
        "Drop food and pick it back up",
        "Hold for 60 seconds while preparing food nearby",
        "Step out of sight for 40 seconds",
      ]),
      templateStep("Day 12 — Longer stretches", [
        "Hold for 90 seconds",
        "Step out of sight for 1 minute",
        "Fold laundry nearby for 1 minute",
        "A visitor sits and chats for 1 minute",
      ]),
      templateStep("Day 13 — Public-style distractions", [
        "Walk past with a rolling bag or vacuum",
        "Bounce a ball nearby a few times",
        "Two people talk and move around for 1 minute",
        "Hold for 90 seconds with quiet background noise",
      ]),
      templateStep("Day 14 — Real-life run-through", [
        "Run through a normal routine (door, phone, cooking) for 2 minutes",
        "Step out of sight for 90 seconds",
        "A visitor comes in and stays for 2 minutes",
      ]),
      templateStep("Day 15 — Graduation", [
        "Hold a calm settle for 3 minutes with normal activity around",
        "Step out of sight for 2 minutes",
        "A visitor arrives and chats for 3 minutes",
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
      templateStep("Step 1 — Notice the mat", ["Look at, sniff, or step toward the mat"]),
      templateStep("Step 2 — Get on the mat", ["All four feet on the mat"]),
      templateStep("Step 3 — Sit or down on the mat", ["Sit or down on the mat"]),
      templateStep("Step 4 — Add duration", ["Stay on the mat a few seconds", "Stay on the mat longer"]),
      templateStep("Step 5 — Add distance", ["Step away, then return", "Step further away, then return"]),
      templateStep("Step 6 — Add distractions", ["A toy or object moves nearby", "Another person walks around"]),
      templateStep("Step 7 — Take it on the road", [
        "Practice in a new room",
        "Practice somewhere out of the house (café, park bench, vet waiting room)",
      ]),
    ],
  },
];
