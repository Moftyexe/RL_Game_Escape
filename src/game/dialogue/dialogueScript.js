// Edit character/story text here. Speaker IDs use SPEAKERS below.
// Gate keys1..5 select readiness/day variants (5 means Day5+). Arrays play in order.
// Add/remove whole entries; each dialogue entry needs speaker and nonempty text.
// battle.actionLines and wife strings keep their quotes for the existing speech renderer.
// UI labels and purely mechanical result messages stay outside this file.
export const GAME_DIALOGUE = {
    "gate": {
        "1": [
            {
                "speaker": "guard",
                "text": "Where do you think you’re going?"
            },
            {
                "speaker": "player",
                "text": "Home."
            },
            {
                "speaker": "guard",
                "text": "You’re not going anywhere until you get through me."
            }
        ],
        "2": [
            {
                "speaker": "guard",
                "text": "You got lucky yesterday."
            },
            {
                "speaker": "player",
                "text": "Then let’s see if it happens again."
            },
            {
                "speaker": "guard",
                "text": "Won't let you go through this time."
            }
        ],
        "3": [
            {
                "speaker": "guard",
                "text": "I know your tricks now."
            },
            {
                "speaker": "player",
                "text": "Good thing I brought my backpack."
            }
        ],
        "4": [
            {
                "speaker": "guard",
                "text": "Not happening again."
            },
            {
                "speaker": "player",
                "text": "I’m still going home."
            }
        ],
        "5": [
            {
                "speaker": "guard",
                "text": "I’m not letting you through this time."
            },
            {
                "speaker": "player",
                "text": "Another day. Another way out."
            }
        ]
    },
    "musicGuy": {
        "greeting": [
            {
                "speaker": "musicGuy",
                "text": "Need me to fix the mix?"
            }
        ]
    },
    "battle": {
        "introduction": "The School Guard blocks your way.",
        "actionLines": {
            "broLockIn": "\"Bro, lock in.\"",
            "lookThere": "\"WAIT—LOOK THERE!\"",
            "swingBackpack": "\"Sorry. Not really.\"",
            "catchBreath": "\"...give me a second.\"",
            "crackKnuckles": "\"I'm done messing around.\"",
            "blowWhistle": "\"Hurt your ears?\"",
            "callWife": "\"That kid is bullying me again!\"",
            "eatDonut": "\"Yum.\""
        },
        "player": {
            "talkSmack": [
                "\"You guard a hallway like it's the last donut on Earth.\"",
                "\"Bro, your belt is doing more work than you are.\"",
                "\"You look like detention became a person.\"",
                "\"Your cardio is walking kids back to class.\"",
                "\"Did you become a school guard because hall monitor was taken?\"",
                "\"Even the vending machine has more authority than you.\"",
                "\"You look like PE has been your lifelong enemy.\"",
                "\"Your life peaked at confiscating energy drinks.\"",
                "\"I've seen fire doors with more personality.\"",
                "\"Your New Year's resolution has been 'next year' for ten years.\"",
                "\"You're one donut away from becoming school property.\"",
                "\"Imagine waking up and choosing hallway security.\"",
                "\"You really looked at your life and said: yeah, school corridor.\"",
                "\"That uniform is fighting for its life.\"",
                "\"You're built like the reason the staff room runs out of biscuits.\""
            ]
        },
        "wife": {
            "RILED": "\"Calm down, honey. It's a child.\"",
            "DISTRACTED": "\"Focus, honey. You've got this.\"",
            "FOCUSED": "\"You're doing great, honey.\"",
            "default": "\"You've got this, honey.\""
        },
        "victory": [],
        "defeat": []
    },
    "fallback": [
        {
            "speaker": "guard",
            "text": "The gate is closed."
        }
    ],
    "narrative": {
        "nextDay": "THE NEXT DAY",
        "readiness": "The Guard is {readiness}."
    }
};

export const SPEAKERS = {
    "player": {
        "name": "Player",
        "textureKey": "player-dialogue-portrait",
        "file": "assets/portraits/player.png"
    },
    "guard": {
        "name": "School Guard",
        "textureKey": "guard-dialogue-portrait",
        "file": "assets/portraits/guard.png"
    },
    "musicGuy": {
        "name": "@prodbyhajime",
        "textureKey": "music-guy-dialogue-portrait",
        "file": "assets/portraits/musicguy.png"
    },
    "wife": {
        "name": "WIFE / PHONE",
        "textureKey": null,
        "file": null
    }
};

export function getDialogue(path){return path.split('.').reduce((v,k)=>v?.[k],GAME_DIALOGUE);}
