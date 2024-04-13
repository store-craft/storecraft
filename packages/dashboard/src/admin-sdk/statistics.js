import { StorecraftAdminSDK } from './index.js'
import { fetchApiWithAuth } from './utils.api.fetch.js';

const test = {
  "info": {
      "maxOrderTime": "1713002568662",
      "days": {
          "1708214400000": {
              "total": "320",
              "discounts": {
                  "order-above-299": "1"
              },
              "collections": {
                  "limited-run-games": "1",
                  "ps4-games": "1"
              },
              "orders": "1",
              "day": "1708214400000",
              "products": {
                  "the-takeover-lrg-ps4": {
                      "val": "1",
                      "handle": "the-takeover-lrg-ps4",
                      "title": "The takeover LRG PS4"
                  }
              },
              "tags": {
                  "company_limited-run-games": "1",
                  "filter:genre_action": "1",
                  "company_sony": "1",
                  "filter:region_NTSC": "1",
                  "filter:type_game": "1",
                  "filter:console_ps4": "1",
                  "collection:type_games": "1",
                  "filter:condition_new": "1"
              }
          },
          "1711670400000": {
              "total": "228",
              "discounts": {
                  "wushtok": "1"
              },
              "collections": {
                  "nintendo-3ds-games": "2"
              },
              "orders": "1",
              "day": "1711670400000",
              "products": {
                  "luigi-s-mansion-dark-moon-nintendo-selects": {
                      "val": "1",
                      "handle": "luigi-s-mansion-dark-moon-nintendo-selects",
                      "title": "Luigi's mansion dark moon (Nintendo selects) "
                  },
                  "professor-layton-and-the-miracle-mask": {
                      "val": "1",
                      "handle": "professor-layton-and-the-miracle-mask",
                      "title": "Professor layton and the miracle mask "
                  }
              },
              "tags": {
                  "filter:genre_quest": "1",
                  "filter:region_PAL": "1",
                  "company_nintendo": "2",
                  "filter:console_3ds": "2",
                  "filter:condition_used": "2",
                  "filter:genre_puzzle": "1",
                  "filter:region_NTSC": "1",
                  "filter:type_game": "2",
                  "filter:condition_complete": "2",
                  "filter:condition_like-new": "2",
                  "filter:genre_platformer": "1",
                  "filter:genre_adventure": "1"
              }
          },
          "1706400000000": {
              "total": "185",
              "discounts": {},
              "collections": {
                  "ps3-games": "2"
              },
              "orders": "1",
              "day": "1706400000000",
              "products": {
                  "sonic-unleashed-ntsc-cib": {
                      "val": "1",
                      "handle": "sonic-unleashed-ntsc-cib",
                      "title": "Sonic unleashed (Ntsc) CiB"
                  },
                  "sonic-unleashed-pal": {
                      "val": "1",
                      "handle": "sonic-unleashed-pal",
                      "title": "Sonic unleashed (Pal)"
                  }
              },
              "tags": {
                  "filter:genre_metroidvania": "2",
                  "filter:region_PAL": "2",
                  "filter:genre_quest": "2",
                  "filter:condition_box": "1",
                  "company_sony": "2",
                  "filter:condition_disc": "1",
                  "filter:type_game": "2",
                  "filter:console_ps3": "2",
                  "filter:condition_complete": "1",
                  "filter:condition_no-manual": "1",
                  "filter:condition_like-new": "2"
              }
          },
          "1710892800000": {
              "total": "155",
              "discounts": {},
              "collections": {
                  "ps1-games": "1"
              },
              "orders": "1",
              "day": "1710892800000",
              "products": {
                  "final-fantasy-vii-no-manual": {
                      "val": "1",
                      "handle": "final-fantasy-vii-no-manual",
                      "title": "final fantasy VII (no manual)"
                  }
              },
              "tags": {
                  "filter:region_PAL": "1",
                  "filter:genre_rpg": "1",
                  "company_sony": "1",
                  "filter:condition_used": "1",
                  "filter:type_game": "1",
                  "filter:condition_no-manual": "1",
                  "filter:console_ps1": "1",
                  "filter:genre_j-rpg": "1"
              }
          },
          "1711584000000": {
              "total": 208.5,
              "discounts": {
                  "wushtok": "2"
              },
              "collections": {
                  "wii-u-games": "3"
              },
              "orders": "2",
              "day": "1711584000000",
              "products": {
                  "skylanders-imaginations": {
                      "val": "2",
                      "handle": "skylanders-imaginations",
                      "title": "skylanders imaginations"
                  },
                  "wii-fit-u": {
                      "val": "1",
                      "handle": "wii-fit-u",
                      "title": "wii fit u"
                  }
              },
              "tags": {
                  "filter:genre_sports": "1",
                  "filter:region_PAL": "3",
                  "company_nintendo": "3",
                  "filter:condition_used": "3",
                  "filter:console_wii-u": "3",
                  "filter:genre_party": "2",
                  "filter:type_game": "3",
                  "filter:condition_complete": "3",
                  "filter:condition_like-new": "3",
                  "filter:genre_platformer": "2",
                  "filter:genre_AAA": "3"
              }
          },
          "1705708800000": {
              "total": "270",
              "discounts": {},
              "collections": {
                  "ps2-games": "3"
              },
              "orders": "1",
              "day": "1705708800000",
              "products": {
                  "grand-theft-auto-liberty-city-stories": {
                      "val": "1",
                      "handle": "grand-theft-auto-liberty-city-stories",
                      "title": "grand theft auto - liberty city stories"
                  },
                  "commandos-2": {
                      "val": "1",
                      "handle": "commandos-2",
                      "title": "Commandos 2"
                  },
                  "prince-of-persia-trilogy": {
                      "val": "1",
                      "handle": "prince-of-persia-trilogy",
                      "title": "Prince of persia trilogy "
                  }
              },
              "tags": {
                  "filter:region_PAL": "3",
                  "filter:genre_quest": "1",
                  "filter:genre_action": "1",
                  "filter:condition_complete": "3",
                  "filter:condition_like-new": "2",
                  "filter:console_ps2": "3",
                  "filter:genre_AAA": "1",
                  "filter:condition_ok": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "3",
                  "filter:condition_used": "3",
                  "filter:type_game": "3",
                  "filter:genre_adventure": "1"
              }
          },
          "1707091200000": {
              "total": "309",
              "discounts": {
                  "order-above-299": "1",
                  "wushtok": "1"
              },
              "collections": {
                  "nintendo-gamecube-games": "2"
              },
              "orders": "1",
              "day": "1707091200000",
              "products": {
                  "super-smash-bros-melee": {
                      "val": "1",
                      "handle": "super-smash-bros-melee",
                      "title": "Super smash bros Melee"
                  },
                  "sonic-adventure-players-choice-pal": {
                      "val": "1",
                      "handle": "sonic-adventure-players-choice-pal",
                      "title": "Sonic adventure Players choice Pal"
                  }
              },
              "tags": {
                  "filter:region_PAL": "2",
                  "filter:genre_arcade": "1",
                  "company_nintendo": "2",
                  "filter:condition_used": "2",
                  "filter:type_game": "2",
                  "filter:condition_no-manual": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "2",
                  "filter:genre_multi-player": "1",
                  "filter:genre_adventure": "1",
                  "filter:console_gamecube": "2"
              }
          },
          "1710028800000": {
              "total": "162",
              "discounts": {},
              "collections": {
                  "ps3-games": "3"
              },
              "orders": "2",
              "day": "1710028800000",
              "products": {
                  "lego-batman-2-greatest-hits": {
                      "val": "1",
                      "handle": "lego-batman-2-greatest-hits",
                      "title": "Lego batman 2 (Greatest hits)"
                  },
                  "uncharted-2": {
                      "val": "1",
                      "handle": "uncharted-2",
                      "title": "Uncharted 2"
                  },
                  "gta-iv-platinum": {
                      "val": "1",
                      "handle": "gta-iv-platinum",
                      "title": "GTA IV (Platinum)"
                  }
              },
              "tags": {
                  "filter:genre_kids": "1",
                  "filter:region_PAL": "2",
                  "filter:genre_action": "1",
                  "filter:region_NTSC": "1",
                  "filter:console_ps3": "3",
                  "filter:condition_no-manual": "3",
                  "filter:condition_like-new": "1",
                  "filter:condition_box": "1",
                  "filter:condition_ok": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "3",
                  "filter:condition_used": "3",
                  "filter:type_game": "3",
                  "filter:genre_platformer": "1",
                  "filter:genre_adventure": "1"
              }
          },
          "1711756800000": {
              "total": "120",
              "discounts": {
                  "wushtok": "1"
              },
              "collections": {
                  "ps2-games": "1"
              },
              "orders": "1",
              "day": "1711756800000",
              "products": {
                  "manhunt-1": {
                      "val": "1",
                      "handle": "manhunt-1",
                      "title": "Manhunt 1 "
                  }
              },
              "tags": {
                  "filter:region_PAL": "1",
                  "filter:genre_horror": "1",
                  "company_sony": "1",
                  "filter:condition_used": "1",
                  "filter:type_game": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "1",
                  "filter:console_ps2": "1"
              }
          },
          "1708128000000": {
              "total": "625",
              "discounts": {},
              "collections": {
                  "ps3-games": "9"
              },
              "orders": "3",
              "day": "1708128000000",
              "products": {
                  "pes-2009": {
                      "val": "1",
                      "handle": "pes-2009",
                      "title": "Pes 2009"
                  },
                  "pes-2008": {
                      "val": "1",
                      "handle": "pes-2008",
                      "title": "Pes 2008"
                  },
                  "pes-13": {
                      "val": "1",
                      "handle": "pes-13",
                      "title": "Pes 13 "
                  },
                  "pes-12": {
                      "val": "1",
                      "handle": "pes-12",
                      "title": "Pes 12"
                  },
                  "prototype-ntsc": {
                      "val": "1",
                      "handle": "prototype-ntsc",
                      "title": "Prototype"
                  },
                  "god-of-war-collection": {
                      "val": "1",
                      "handle": "god-of-war-collection",
                      "title": "God of war collection "
                  },
                  "rachet-clank-toosl-of-destruction": {
                      "val": "1",
                      "handle": "rachet-clank-toosl-of-destruction",
                      "title": "Ratchet and Clank tools of destruction "
                  },
                  "god-of-war-saga": {
                      "val": "1",
                      "handle": "god-of-war-saga",
                      "title": "God of war saga"
                  },
                  "god-of-war-3-ps3": {
                      "val": "1",
                      "handle": "god-of-war-3-ps3",
                      "title": "God of war 3 Ps3 "
                  }
              },
              "tags": {
                  "filter:genre_fighting": "1",
                  "filter:genre_sports": "4",
                  "filter:genre_kids": "4",
                  "filter:region_PAL": "6",
                  "filter:genre_quest": "1",
                  "filter:genre_action": "4",
                  "filter:region_NTSC": "3",
                  "filter:console_ps3": "9",
                  "filter:condition_complete": "9",
                  "filter:condition_like-new": "8",
                  "filter:condition_ok": "1",
                  "company_sony": "9",
                  "filter:condition_used": "9",
                  "filter:type_game": "9",
                  "filter:genre_phantasy": "1"
              }
          },
          "1710979200000": {
              "total": "410",
              "discounts": {},
              "collections": {
                  "megadrive-sega-genesis-games": "1",
                  "ps3-games": "1",
                  "ps1-games": "1"
              },
              "orders": "2",
              "day": "1710979200000",
              "products": {
                  "tales-of-symphoniya-chronicels": {
                      "val": "1",
                      "handle": "tales-of-symphoniya-chronicels",
                      "title": "Tales of symphoniya chronicels "
                  },
                  "danan-the-jungle-figther-game-only": {
                      "val": "1",
                      "handle": "danan-the-jungle-figther-game-only",
                      "title": "Danan the jungle figther (Game only)"
                  },
                  "oddworld-abe-s-oddysse": {
                      "val": "1",
                      "handle": "oddworld-abe-s-oddysse",
                      "title": "oddworld Abe's oddysse"
                  }
              },
              "tags": {
                  "filter:region_PAL": "3",
                  "filter:genre_action": "1",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "1",
                  "filter:console_ps1": "1",
                  "filter:condition_like-new": "1",
                  "filter:condition_cart": "1",
                  "filter:console_Sega-master-system": "1",
                  "filter:genre_j-rpg": "1",
                  "filter:condition_new": "1",
                  "company_sega": "1",
                  "filter:condition_ok": "1",
                  "company_sony": "2",
                  "filter:condition_used": "2",
                  "filter:type_game": "3",
                  "filter:genre_platformer": "1",
                  "filter:genre_phantasy": "1",
                  "filter:genre_adventure": "1"
              }
          },
          "1708041600000": {
              "total": "144",
              "discounts": {
                  "30": "2"
              },
              "collections": {
                  "xbox-360-original-og": "1",
                  "ps4-games": "1"
              },
              "orders": "2",
              "day": "1708041600000",
              "products": {
                  "fairytale-fights": {
                      "val": "1",
                      "handle": "fairytale-fights",
                      "title": "Fairytale fights "
                  },
                  "crash-bandicot-n-sane-trilogy": {
                      "val": "1",
                      "handle": "crash-bandicot-n-sane-trilogy",
                      "title": "Crash bandicot n-sane trilogy "
                  }
              },
              "tags": {
                  "filter:genre_kids": "2",
                  "filter:region_PAL": "2",
                  "filter:condition_bad": "1",
                  "filter:condition_complete": "2",
                  "filter:console_ps4": "1",
                  "filter:condition_like-new": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "1",
                  "filter:condition_used": "2",
                  "company_microsoft": "1",
                  "filter:genre_puzzle": "1",
                  "filter:type_game": "2",
                  "filter:console_xbox-original": "1",
                  "filter:condition_poor": "1",
                  "filter:genre_platformer": "1",
                  "filter:genre_adventure": "1"
              }
          },
          "1712448000000": {
              "total": "230",
              "discounts": {},
              "collections": {
                  "ps3-games": "1"
              },
              "orders": "1",
              "day": "1712448000000",
              "products": {
                  "spiderman-shattered-dimensions-game-only": {
                      "val": "1",
                      "handle": "spiderman-shattered-dimensions-game-only",
                      "title": "Spiderman shattered dimensions (Game only)"
                  }
              },
              "tags": {
                  "filter:region_PAL": "1",
                  "company_sony": "1",
                  "filter:genre_action": "1",
                  "filter:condition_disc": "1",
                  "filter:condition_used": "1",
                  "filter:type_game": "1",
                  "filter:console_ps3": "1",
                  "filter:condition_like-new": "1"
              }
          },
          "1711065600000": {
              "total": "120",
              "discounts": {
                  "wushtok": "1"
              },
              "collections": {
                  "ps1-games": "1"
              },
              "orders": "1",
              "day": "1711065600000",
              "products": {
                  "oddworld-abe-s-oddysse": {
                      "val": "1",
                      "handle": "oddworld-abe-s-oddysse",
                      "title": "oddworld Abe's oddysse"
                  }
              },
              "tags": {
                  "filter:region_PAL": "1",
                  "company_sony": "1",
                  "filter:genre_action": "1",
                  "filter:condition_used": "1",
                  "filter:type_game": "1",
                  "filter:console_ps1": "1",
                  "filter:condition_like-new": "1",
                  "filter:genre_platformer": "1"
              }
          },
          "1705276800000": {
              "total": "905",
              "discounts": {
                  "order-above-299": "1"
              },
              "collections": {
                  "gameboy-original-games": "3",
                  "consoles": "1",
                  "ps3-games": "2"
              },
              "orders": "2",
              "day": "1705276800000",
              "products": {
                  "gameboy-color-atomic-purple": {
                      "val": "1",
                      "handle": "gameboy-color-atomic-purple",
                      "title": "Gameboy color atomic purple "
                  },
                  "pokemon-yellow-game-only-german-edition": {
                      "val": "1",
                      "handle": "pokemon-yellow-game-only-german-edition",
                      "title": "Pokemon yellow (Game only,German edition) "
                  },
                  "lego-batman-1": {
                      "val": "1",
                      "handle": "lego-batman-1",
                      "title": "Lego batman 1 "
                  },
                  "tetris-gameboy-game-only-": {
                      "val": "1",
                      "handle": "tetris-gameboy-game-only-",
                      "title": "Tetris Gameboy (Game Only)"
                  },
                  "lego-dimensions": {
                      "val": "1",
                      "handle": "lego-dimensions",
                      "title": "Lego dimensions "
                  },
                  "super-mario-land-1-gameboy-game-only-": {
                      "val": "1",
                      "handle": "super-mario-land-1-gameboy-game-only-",
                      "title": "Super mario land 1 Gameboy (Game Only)"
                  }
              },
              "tags": {
                  "filter:genre_kids": "2",
                  "filter:region_PAL": "3",
                  "filter:genre_quest": "1",
                  "company_nintendo": "4",
                  "filter:region_NTSC": "2",
                  "filter:console_ps3": "2",
                  "filter:condition_complete": "2",
                  "filter:condition_like-new": "6",
                  "filter:type_console": "1",
                  "filter:condition_cart": "3",
                  "filter:console_gbc": "1",
                  "company_sony": "2",
                  "filter:condition_used": "6",
                  "filter:genre_puzzle": "1",
                  "filter:type_game": "5",
                  "filter:console_gameboy": "3",
                  "filter:genre_platformer": "1",
                  "filter:genre_adventure": "3"
              }
          },
          "1706054400000": {
              "total": "298",
              "discounts": {
                  "wushtok": "1"
              },
              "collections": {
                  "wii-games": "1",
                  "nintendo-3ds-games": "2"
              },
              "orders": "2",
              "day": "1706054400000",
              "products": {
                  "super-smash-bros-3ds-ntsc": {
                      "val": "1",
                      "handle": "super-smash-bros-3ds-ntsc",
                      "title": "super smash bros 3ds Ntsc "
                  },
                  "wii-sports-big-box": {
                      "val": "1",
                      "handle": "wii-sports-big-box",
                      "title": "Wii sports (Big box) "
                  },
                  "castlevania-mirror-of-fate": {
                      "val": "1",
                      "handle": "castlevania-mirror-of-fate",
                      "title": "Castlevania mirror of fate "
                  }
              },
              "tags": {
                  "filter:genre_fighting": "1",
                  "filter:genre_metroidvania": "1",
                  "filter:genre_sports": "1",
                  "filter:region_PAL": "1",
                  "company_nintendo": "3",
                  "filter:console_wii": "1",
                  "filter:genre_action": "2",
                  "filter:region_NTSC": "2",
                  "filter:condition_no-manual": "1",
                  "filter:condition_cart": "1",
                  "filter:genre_AAA": "1",
                  "filter:condition_new": "1",
                  "filter:condition_scratched-disc": "1",
                  "filter:console_3ds": "2",
                  "filter:condition_used": "2",
                  "filter:type_game": "3",
                  "filter:condition_poor": "1",
                  "filter:genre_platformer": "1",
                  "filter:genre_adventure": "2"
              }
          },
          "1710720000000": {
              "total": "800",
              "discounts": {
                  "order-above-299": "1",
                  "ido123": "1"
              },
              "collections": {
                  "ps2-games": "1",
                  "super-nintendo-games": "2",
                  "ps3-games": "4",
                  "ps1-games": "2",
                  "n64-games": "1"
              },
              "orders": "3",
              "day": "1710720000000",
              "products": {
                  "damnation": {
                      "val": "1",
                      "handle": "damnation",
                      "title": "Damnation "
                  },
                  "dragon-ball-budokai-tenkaichi-platinum": {
                      "val": "1",
                      "handle": "dragon-ball-budokai-tenkaichi-platinum",
                      "title": "Dragon ball budokai tenkaichi (Platinum) "
                  },
                  "donkey-kong-country-pal-game-only": {
                      "val": "1",
                      "handle": "donkey-kong-country-pal-game-only",
                      "title": "Donkey kong country Pal (Game only)"
                  },
                  "super-mario-world-snes-pal-game-only": {
                      "val": "1",
                      "handle": "super-mario-world-snes-pal-game-only",
                      "title": "Super mario world Snes Pal (Game Only)"
                  },
                  "rayman-1-platinum": {
                      "val": "1",
                      "handle": "rayman-1-platinum",
                      "title": "Rayman 1 (Platinum ) "
                  },
                  "timeshift": {
                      "val": "1",
                      "handle": "timeshift",
                      "title": "timeshift"
                  },
                  "mickey-mania-game-only": {
                      "val": "1",
                      "handle": "mickey-mania-game-only",
                      "title": "Mickey mania (Game only)"
                  },
                  "duke-nukem-time-to-kill": {
                      "val": "1",
                      "handle": "duke-nukem-time-to-kill",
                      "title": "duke nukem time to kill"
                  },
                  "megamind-ultimate-showdown": {
                      "val": "1",
                      "handle": "megamind-ultimate-showdown",
                      "title": "Megamind ultimate showdown "
                  },
                  "grand-theft-auto-san-andreas-greatest-hits": {
                      "val": "1",
                      "handle": "grand-theft-auto-san-andreas-greatest-hits",
                      "title": "Grand theft auto san andreas (Greatest hits) "
                  }
              },
              "tags": {
                  "filter:genre_fighting": "1",
                  "filter:genre_quest": "1",
                  "company_nintendo": "3",
                  "filter:genre_fps": "1",
                  "filter:genre_action": "3",
                  "filter:console_snes": "3",
                  "filter:region_NTSC": "1",
                  "filter:condition_like-new": "6",
                  "filter:genre_AAA": "2",
                  "filter:condition_new": "1",
                  "filter:genre_indie": "2",
                  "filter:condition_ok": "3",
                  "company_sony": "7",
                  "filter:condition_used": "9",
                  "filter:type_game": "10",
                  "filter:genre_platformer": "4",
                  "filter:genre_adventure": "3",
                  "filter:genre_kids": "1",
                  "filter:region_PAL": "9",
                  "filter:console_ps3": "4",
                  "filter:condition_complete": "5",
                  "filter:condition_no-manual": "1",
                  "filter:condition_cart": "3",
                  "filter:console_ps1": "2",
                  "filter:console_ps2": "1",
                  "filter:condition_scratched-disc": "2",
                  "filter:genre_phantasy": "1"
              }
          },
          "1710806400000": {
              "total": 1687.1,
              "discounts": {
                  "order-above-299": "1",
                  "wushtok": "2"
              },
              "collections": {
                  "gameboy-original-games": "1",
                  "ps2-games": "2",
                  "nintendo-switch-games": "1",
                  "limited-run-games": "1",
                  "dreamcast-games": "4",
                  "ps3-games": "2"
              },
              "orders": "3",
              "day": "1710806400000",
              "products": {
                  "call-of-juarez-bound-to-blood-ps3": {
                      "val": "1",
                      "handle": "call-of-juarez-bound-to-blood-ps3",
                      "title": "Call of juarez bound to blood Ps3 "
                  },
                  "sonic-adventure": {
                      "val": "1",
                      "handle": "sonic-adventure",
                      "title": "sonic adventure"
                  },
                  "cannon-spike": {
                      "val": "1",
                      "handle": "cannon-spike",
                      "title": "cannon spike"
                  },
                  "the-simpsons-road-rage-pal": {
                      "val": "1",
                      "handle": "the-simpsons-road-rage-pal",
                      "title": "The simpsons road rage Pal"
                  },
                  "grand-theft-auto-iv": {
                      "val": "1",
                      "handle": "grand-theft-auto-iv",
                      "title": "Grand theft auto Iv Ps3"
                  },
                  "the-simpsons-ps2": {
                      "val": "1",
                      "handle": "the-simpsons-ps2",
                      "title": "The simpsons Ps2"
                  },
                  "dead-or-alive-2-dreamcast": {
                      "val": "1",
                      "handle": "dead-or-alive-2-dreamcast",
                      "title": "Dead or alive 2 Dreamcast"
                  },
                  "soul-calibur": {
                      "val": "1",
                      "handle": "soul-calibur",
                      "title": "soul calibur"
                  },
                  "infernax-lrg-switch": {
                      "val": "1",
                      "handle": "infernax-lrg-switch",
                      "title": "Infernax LRG switch"
                  },
                  "kirby-s-block-ball-game-and-manual-only": {
                      "val": "1",
                      "handle": "kirby-s-block-ball-game-and-manual-only",
                      "title": "Kirby's block ball (Game and manual only) "
                  }
              },
              "tags": {
                  "filter:console_dreamcast": "4",
                  "filter:genre_fighting": "1",
                  "filter:genre_quest": "1",
                  "company_nintendo": "2",
                  "filter:console_switch": "1",
                  "filter:genre_action": "5",
                  "filter:region_NTSC": "5",
                  "filter:condition_like-new": "8",
                  "filter:condition_new": "1",
                  "condition_good": "1",
                  "company_sega": "4",
                  "company_sony": "4",
                  "filter:condition_used": "9",
                  "filter:type_game": "10",
                  "filter:console_gameboy": "1",
                  "filter:genre_platformer": "4",
                  "filter:condition_manual": "1",
                  "filter:genre_adventure": "1",
                  "filter:region_PAL": "5",
                  "company_limited-run-games": "1",
                  "filter:console_ps3": "2",
                  "filter:condition_no-manual": "1",
                  "filter:condition_complete": "8",
                  "filter:condition_cart": "1",
                  "filter:console_ps2": "2",
                  "collection:type_games": "1",
                  "filter:condition_scratched-disc": "1",
                  "filter:genre_driving": "1"
              }
          },
          "1709596800000": {
              "total": "789",
              "discounts": {
                  "order-above-299": "1",
                  "wushtok": "1"
              },
              "collections": {
                  "xbox-360-original-og": "2",
                  "ps3-games": "7",
                  "ps1-games": "5"
              },
              "orders": "5",
              "day": "1709596800000",
              "products": {
                  "need-for-speed-undercover": {
                      "val": "1",
                      "handle": "need-for-speed-undercover",
                      "title": "need for speed undercover "
                  },
                  "jurassic-park-the-lost-world": {
                      "val": "1",
                      "handle": "jurassic-park-the-lost-world",
                      "title": "Jurassic park the lost world"
                  },
                  "tekken-tag-2-essentials-": {
                      "val": "1",
                      "handle": "tekken-tag-2-essentials-",
                      "title": "Tekken tag 2 (Essentials)"
                  },
                  "driver-san-fransicisco": {
                      "val": "1",
                      "handle": "driver-san-fransicisco",
                      "title": "Driver san fransicisco"
                  },
                  "monsters-inc-scare-island": {
                      "val": "1",
                      "handle": "monsters-inc-scare-island",
                      "title": "monsters inc scare island (platinum)"
                  },
                  "smackdown-2008-ps3": {
                      "val": "1",
                      "handle": "smackdown-2008-ps3",
                      "title": "Smackdown 2008 Ps3 "
                  },
                  "rayman-2-the-great-escape-platinum": {
                      "val": "1",
                      "handle": "rayman-2-the-great-escape-platinum",
                      "title": "rayman 2 the great escape (platinum)"
                  },
                  "need-for-speed-shift": {
                      "val": "1",
                      "handle": "need-for-speed-shift",
                      "title": "need for speed shift"
                  },
                  "call-of-duty-black-ops-1-xbox360": {
                      "val": "1",
                      "handle": "call-of-duty-black-ops-1-xbox360",
                      "title": "Call of duty black ops 1 xbox360"
                  },
                  "gta-liberty-city-episodes-xbox360-french-version": {
                      "val": "1",
                      "handle": "gta-liberty-city-episodes-xbox360-french-version",
                      "title": "Gta liberty city episodes French Version"
                  },
                  "lego-batman-2": {
                      "val": "1",
                      "handle": "lego-batman-2",
                      "title": "Lego batman 2 "
                  },
                  "hercules-platinum": {
                      "val": "1",
                      "handle": "hercules-platinum",
                      "title": "Hercules (platinum)"
                  },
                  "lego-marvel-super-heros": {
                      "val": "1",
                      "handle": "lego-marvel-super-heros",
                      "title": "Lego marvel super heros "
                  },
                  "crash-bandicoot-3-warped": {
                      "val": "1",
                      "handle": "crash-bandicoot-3-warped",
                      "title": "crash bandicoot 3 warped "
                  }
              },
              "tags": {
                  "filter:genre_quest": "1",
                  "filter:genre_racing": "3",
                  "filter:genre_fps": "1",
                  "filter:genre_action": "6",
                  "filter:region_NTSC": "1",
                  "filter:condition_like-new": "7",
                  "filter:genre_AAA": "2",
                  "filter:condition_ok": "6",
                  "filter:condition_box": "1",
                  "company_sony": "13",
                  "filter:condition_used": "14",
                  "filter:condition_disc": "2",
                  "filter:type_game": "14",
                  "filter:console_xbox-360": "2",
                  "filter:genre_platformer": "6",
                  "filter:genre_adventure": "3",
                  "filter:genre_kids": "1",
                  "filter:region_PAL": "11",
                  "filter:console_ps3": "7",
                  "filter:condition_complete": "8",
                  "filter:condition_no-manual": "4",
                  "filter:console_ps1": "5",
                  "filter:condition_scratched-disc": "1",
                  "company_microsoft": "1",
                  "filter:genre_puzzle": "1",
                  "filter:genre_driving": "2"
              }
          },
          "1706745600000": {
              "total": "200",
              "discounts": {},
              "collections": {
                  "accessories": "2"
              },
              "orders": "2",
              "day": "1706745600000",
              "products": {
                  "xbox-360-oem-controller-linked": {
                      "val": "1",
                      "handle": "xbox-360-oem-controller-linked",
                      "title": "Xbox 360 Oem controller (Linked)"
                  },
                  "ps3-move-controller": {
                      "val": "1",
                      "handle": "ps3-move-controller",
                      "title": "Ps3 move controller"
                  }
              },
              "tags": {
                  "filter:type_accessory": "2",
                  "company_nintendo": "1",
                  "company_sony": "1",
                  "filter:accessory_controller": "1",
                  "filter:condition_used": "2",
                  "filter:console_ps3": "1",
                  "menuitem:type_accessories": "1",
                  "filter:console_xbox-360": "1",
                  "filter:condition_like-new": "2"
              }
          },
          "1707004800000": {
              "total": "380",
              "discounts": {},
              "collections": {
                  "ps3-games": "5"
              },
              "orders": "2",
              "day": "1707004800000",
              "products": {
                  "lego-batman-1-scratched-a-little": {
                      "val": "1",
                      "handle": "lego-batman-1-scratched-a-little",
                      "title": "Lego batman 1 (Scratched a little) "
                  },
                  "smackdown-2009-ps3": {
                      "val": "1",
                      "handle": "smackdown-2009-ps3",
                      "title": "Smackdown 2009 Ps3 "
                  },
                  "lego-batman-2": {
                      "val": "1",
                      "handle": "lego-batman-2",
                      "title": "Lego batman 2 "
                  },
                  "god-of-war-collection": {
                      "val": "1",
                      "handle": "god-of-war-collection",
                      "title": "God of war collection "
                  },
                  "call-of-duty-ghosts": {
                      "val": "1",
                      "handle": "call-of-duty-ghosts",
                      "title": "Call of duty ghosts"
                  }
              },
              "tags": {
                  "filter:genre_kids": "2",
                  "filter:region_PAL": "4",
                  "filter:genre_quest": "1",
                  "filter:genre_fps": "1",
                  "filter:genre_action": "2",
                  "filter:region_NTSC": "1",
                  "filter:console_ps3": "5",
                  "filter:condition_complete": "4",
                  "filter:condition_no-manual": "1",
                  "filter:condition_like-new": "5",
                  "company_sega": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "4",
                  "filter:condition_used": "5",
                  "filter:type_game": "5",
                  "filter:genre_platformer": "1"
              }
          },
          "1712188800000": {
              "total": "300",
              "discounts": {
                  "order-above-299": "1"
              },
              "collections": {
                  "ps3-games": "1"
              },
              "orders": "1",
              "day": "1712188800000",
              "products": {
                  "spiderman-shattered-dimensions": {
                      "val": "1",
                      "handle": "spiderman-shattered-dimensions",
                      "title": "Spiderman shattered dimensions "
                  }
              },
              "tags": {
                  "filter:region_PAL": "1",
                  "company_sony": "1",
                  "filter:genre_action": "1",
                  "filter:condition_used": "1",
                  "filter:type_game": "1",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "1"
              }
          },
          "1705881600000": {
              "total": "260",
              "discounts": {},
              "collections": {
                  "nintendo-switch-games": "1",
                  "ps3-games": "2"
              },
              "orders": "2",
              "day": "1705881600000",
              "products": {
                  "paper-mario-origami-king": {
                      "val": "1",
                      "handle": "paper-mario-origami-king",
                      "title": "Paper mario origami king "
                  },
                  "lego-batman-1": {
                      "val": "1",
                      "handle": "lego-batman-1",
                      "title": "Lego batman 1 "
                  },
                  "lego-dimensions": {
                      "val": "1",
                      "handle": "lego-dimensions",
                      "title": "Lego dimensions "
                  }
              },
              "tags": {
                  "filter:genre_kids": "3",
                  "filter:genre_quest": "1",
                  "company_nintendo": "1",
                  "filter:console_switch": "1",
                  "company_sony": "2",
                  "filter:condition_used": "3",
                  "filter:genre_puzzle": "1",
                  "filter:region_NTSC": "3",
                  "filter:type_game": "3",
                  "filter:console_ps3": "2",
                  "filter:condition_complete": "3",
                  "filter:condition_like-new": "3"
              }
          },
          "1709510400000": {
              "total": 540.5,
              "discounts": {
                  "order-above-299": "1",
                  "wushtok": "1"
              },
              "collections": {
                  "accessories": "2",
                  "wii-games": "1",
                  "consoles": "1",
                  "ps1-games": "1"
              },
              "orders": "2",
              "day": "1709510400000",
              "products": {
                  "wii-remote-white": {
                      "val": "1",
                      "handle": "wii-remote-white",
                      "title": "Wii remote Oem(WHITE)"
                  },
                  "south-park": {
                      "val": "1",
                      "handle": "south-park",
                      "title": "south park"
                  },
                  "wii-ntsc": {
                      "val": "1",
                      "handle": "wii-ntsc",
                      "title": "Wii NTSC "
                  },
                  "wii-nunchuck-oem-black": {
                      "val": "1",
                      "handle": "wii-nunchuck-oem-black",
                      "title": "Wii nunchuck Oem (Black)"
                  },
                  "wii-sports-resort": {
                      "val": "1",
                      "handle": "wii-sports-resort",
                      "title": "Wii sports resort"
                  }
              },
              "tags": {
                  "filter:genre_sports": "1",
                  "filter:type_accessory": "2",
                  "filter:region_PAL": "2",
                  "company_nintendo": "4",
                  "filter:console_wii": "4",
                  "filter:region_NTSC": "1",
                  "filter:condition_no-manual": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "4",
                  "filter:type_console": "1",
                  "filter:console_ps1": "1",
                  "filter:genre_AAA": "1",
                  "filter:condition_ok": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "1",
                  "filter:condition_used": "5",
                  "filter:type_game": "2",
                  "filter:genre_platformer": "1",
                  "filter:genre_adventure": "2"
              }
          },
          "1708732800000": {
              "total": "95",
              "discounts": {},
              "collections": {
                  "ps3-games": "1"
              },
              "orders": "1",
              "day": "1708732800000",
              "products": {
                  "lego-batman-1-scratched-a-little": {
                      "val": "1",
                      "handle": "lego-batman-1-scratched-a-little",
                      "title": "Lego batman 1 (Scratched a little) "
                  }
              },
              "tags": {
                  "filter:genre_kids": "1",
                  "filter:genre_quest": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "1",
                  "filter:condition_used": "1",
                  "filter:region_NTSC": "1",
                  "filter:type_game": "1",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "1"
              }
          },
          "1707868800000": {
              "total": "424",
              "discounts": {
                  "30": "2",
                  "order-above-299": "1"
              },
              "collections": {
                  "accessories": "1",
                  "ps4-games": "2",
                  "ps3-games": "3"
              },
              "orders": "2",
              "day": "1707868800000",
              "products": {
                  "assassins-creed-3-steelbook-ps3": {
                      "val": "1",
                      "handle": "assassins-creed-3-steelbook-ps3",
                      "title": "Assassins creed 3 steelbook Ps3 "
                  },
                  "bioshock-the-collection": {
                      "val": "1",
                      "handle": "bioshock-the-collection",
                      "title": "Bioshock the collection"
                  },
                  "a-plague-tale-innocence": {
                      "val": "1",
                      "handle": "a-plague-tale-innocence",
                      "title": "A plague tale  Innocence "
                  },
                  "007-blood-stone": {
                      "val": "1",
                      "handle": "007-blood-stone",
                      "title": "007 Blood stone"
                  },
                  "skylander-figures-portal-for-the-3ds": {
                      "val": "1",
                      "handle": "skylander-figures-portal-for-the-3ds",
                      "title": "Skylander figures&portal for the 3ds "
                  },
                  "game-of-thrones": {
                      "val": "1",
                      "handle": "game-of-thrones",
                      "title": "Game of thrones "
                  }
              },
              "tags": {
                  "filter:type_accessory": "1",
                  "filter:region_PAL": "1",
                  "filter:genre_quest": "1",
                  "filter:genre_horror": "1",
                  "company_nintendo": "1",
                  "filter:genre_action": "2",
                  "filter:region_NTSC": "4",
                  "filter:genre_party": "1",
                  "filter:console_ps3": "3",
                  "filter:console_ps4": "2",
                  "filter:condition_complete": "5",
                  "filter:condition_like-new": "3",
                  "filter:genre_survival": "1",
                  "filter:condition_new": "1",
                  "filter:condition_ok": "2",
                  "company_sony": "5",
                  "filter:condition_used": "3",
                  "filter:type_game": "5",
                  "filter:condition_poor": "1",
                  "filter:genre_phantasy": "1",
                  "filter:genre_adventure": "3"
              }
          },
          "1709424000000": {
              "total": "500",
              "discounts": {
                  "order-above-299": "1"
              },
              "collections": {
                  "nintendo-gamecube-games": "1"
              },
              "orders": "1",
              "day": "1709424000000",
              "products": {
                  "paper-mario-the-thousand-year-door-players-choice": {
                      "val": "1",
                      "handle": "paper-mario-the-thousand-year-door-players-choice",
                      "title": "Paper mario the thousand year door (Players choice)"
                  }
              },
              "tags": {
                  "company_nintendo": "1",
                  "filter:condition_used": "1",
                  "filter:genre_puzzle": "1",
                  "filter:region_NTSC": "1",
                  "filter:type_game": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "1",
                  "filter:genre_indie": "1",
                  "filter:console_gamecube": "1"
              }
          },
          "1705795200000": {
              "total": "246",
              "discounts": {
                  "wushtok": "1"
              },
              "collections": {
                  "ps4-games": "1",
                  "ps3-games": "1",
                  "ps1-games": "1"
              },
              "orders": "1",
              "day": "1705795200000",
              "products": {
                  "call-of-duty-world-war-2": {
                      "val": "1",
                      "handle": "call-of-duty-world-war-2",
                      "title": "Call of duty world war 2 "
                  },
                  "grand-theft-auto-2": {
                      "val": "1",
                      "handle": "grand-theft-auto-2",
                      "title": "Grand theft auto  2 "
                  },
                  "hitman-hd-trilogy": {
                      "val": "1",
                      "handle": "hitman-hd-trilogy",
                      "title": "Hitman hd trilogy "
                  }
              },
              "tags": {
                  "filter:region_PAL": "3",
                  "filter:genre_fps": "2",
                  "filter:genre_action": "2",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "2",
                  "filter:condition_no-manual": "1",
                  "filter:console_ps4": "1",
                  "filter:console_ps1": "1",
                  "filter:condition_like-new": "2",
                  "filter:genre_AAA": "1",
                  "filter:genre_multi-player": "1",
                  "filter:condition_ok": "1",
                  "company_sony": "3",
                  "filter:condition_used": "3",
                  "filter:type_game": "3"
              }
          },
          "1706832000000": {
              "total": "930",
              "discounts": {
                  "bulk-ps2-selected-3-for-100": "1",
                  "order-above-299": "1"
              },
              "collections": {
                  "ps2-games": "3",
                  "psp-games": "1",
                  "discount-bulk-ps2-selected-3-for-100": "3",
                  "wii-games": "2",
                  "consoles": "1",
                  "ps3-games": "1"
              },
              "orders": "2",
              "day": "1706832000000",
              "products": {
                  "sonic-unleashed-wii": {
                      "val": "1",
                      "handle": "sonic-unleashed-wii",
                      "title": "Sonic unleashed Wii"
                  },
                  "gran-turismo-4-platinum": {
                      "val": "1",
                      "handle": "gran-turismo-4-platinum",
                      "title": "gran turismo 4 (platinum)"
                  },
                  "tales-of-eternia": {
                      "val": "1",
                      "handle": "tales-of-eternia",
                      "title": "tales of eternia"
                  },
                  "black": {
                      "val": "1",
                      "handle": "black",
                      "title": "Black "
                  },
                  "wii-ntsc-cib": {
                      "val": "1",
                      "handle": "wii-ntsc-cib",
                      "title": "Wii NTSC  CIB "
                  },
                  "tales-of-graces-f": {
                      "val": "1",
                      "handle": "tales-of-graces-f",
                      "title": "Tales of graces f "
                  },
                  "dragon-quest-swords": {
                      "val": "1",
                      "handle": "dragon-quest-swords",
                      "title": "dragon quest swords"
                  },
                  "hitman-2-platinum-poor": {
                      "val": "1",
                      "handle": "hitman-2-platinum-poor",
                      "title": "Hitman 2 (Platinum)"
                  }
              },
              "tags": {
                  "filter:genre_quest": "1",
                  "company_nintendo": "3",
                  "filter:genre_rpg": "2",
                  "filter:genre_fps": "2",
                  "filter:region_NTSC": "1",
                  "filter:condition_like-new": "4",
                  "filter:genre_AAA": "2",
                  "filter:condition_new": "1",
                  "filter:condition_ok": "1",
                  "company_sony": "5",
                  "filter:condition_used": "7",
                  "filter:type_game": "7",
                  "filter:genre_adventure": "1",
                  "filter:genre_metroidvania": "1",
                  "filter:region_PAL": "7",
                  "filter:console_wii": "3",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "5",
                  "filter:condition_no-manual": "2",
                  "filter:type_console": "1",
                  "filter:genre_j-rpg": "3",
                  "filter:console_ps2": "3",
                  "filter:console_psp": "1",
                  "filter:genre_driving": "1",
                  "filter:condition_poor": "2",
                  "filter:genre_phantasy": "1"
              }
          },
          "1710288000000": {
              "total": "180",
              "discounts": {},
              "collections": {
                  "ps1-games": "2"
              },
              "orders": "1",
              "day": "1710288000000",
              "products": {
                  "medal-of-honor-underground-platinum": {
                      "val": "1",
                      "handle": "medal-of-honor-underground-platinum",
                      "title": "medal of honor underground (platinum)"
                  },
                  "driver-2-platinum": {
                      "val": "1",
                      "handle": "driver-2-platinum",
                      "title": "driver 2 (platinum)"
                  }
              },
              "tags": {
                  "filter:region_PAL": "2",
                  "filter:genre_fps": "1",
                  "company_sony": "2",
                  "filter:genre_action": "1",
                  "filter:condition_used": "2",
                  "filter:type_game": "2",
                  "filter:genre_driving": "1",
                  "filter:console_ps1": "2",
                  "filter:condition_like-new": "1"
              }
          },
          "1707696000000": {
              "total": 539.5,
              "discounts": {
                  "30": "3"
              },
              "collections": {
                  "gameboy-original-games": "1",
                  "ps2-games": "1",
                  "psp-games": "2",
                  "ps3-games": "1"
              },
              "orders": "4",
              "day": "1707696000000",
              "products": {
                  "tmnt-2": {
                      "val": "1",
                      "handle": "tmnt-2",
                      "title": "Tmnt 2 "
                  },
                  "god-of-war-chains-of-olympus-platinum": {
                      "val": "1",
                      "handle": "god-of-war-chains-of-olympus-platinum",
                      "title": "god of war chains of olympus (platinum)"
                  },
                  "god-of-war-ghost-of-sparta": {
                      "val": "1",
                      "handle": "god-of-war-ghost-of-sparta",
                      "title": "god of war ghost of sparta"
                  },
                  "kirby-s-block-ball-game-and-manual-only": {
                      "val": "1",
                      "handle": "kirby-s-block-ball-game-and-manual-only",
                      "title": "Kirby's block ball (Game and manual only) "
                  },
                  "siren-blood-curse": {
                      "val": "1",
                      "handle": "siren-blood-curse",
                      "title": "Siren blood curse"
                  }
              },
              "tags": {
                  "filter:genre_quest": "1",
                  "filter:region_PAL": "3",
                  "company_nintendo": "1",
                  "filter:genre_horror": "1",
                  "filter:genre_action": "2",
                  "filter:region_NTSC": "2",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "3",
                  "filter:condition_no-manual": "1",
                  "filter:condition_cart": "1",
                  "filter:condition_like-new": "4",
                  "filter:type_console": "1",
                  "filter:console_ps2": "1",
                  "filter:genre_multi-player": "1",
                  "filter:console_psp": "2",
                  "filter:condition_ok": "1",
                  "filter:genre_arcade": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "4",
                  "filter:condition_used": "5",
                  "filter:type_game": "4",
                  "filter:console_gameboy": "1",
                  "filter:genre_platformer": "1",
                  "filter:condition_manual": "1"
              }
          },
          "1707782400000": {
              "total": "280",
              "discounts": {
                  "30": "1"
              },
              "collections": {
                  "xbox-360-original-og": "1",
                  "ps3-games": "3"
              },
              "orders": "2",
              "day": "1707782400000",
              "products": {
                  "lego-batman-1-scratched-a-little": {
                      "val": "1",
                      "handle": "lego-batman-1-scratched-a-little",
                      "title": "Lego batman 1 (Scratched a little) "
                  },
                  "mafia-2": {
                      "val": "1",
                      "handle": "mafia-2",
                      "title": "Mafia 2 "
                  },
                  "lego-batman-2": {
                      "val": "1",
                      "handle": "lego-batman-2",
                      "title": "Lego batman 2 "
                  },
                  "lego-star-wars-the-skywalker-saga": {
                      "val": "1",
                      "handle": "lego-star-wars-the-skywalker-saga",
                      "title": "Lego star wars the skywalker saga "
                  }
              },
              "tags": {
                  "filter:genre_kids": "2",
                  "filter:region_PAL": "3",
                  "filter:genre_quest": "1",
                  "filter:region_NTSC": "1",
                  "filter:console_ps3": "3",
                  "filter:condition_complete": "3",
                  "filter:condition_no-manual": "1",
                  "filter:condition_like-new": "4",
                  "filter:genre_multi-player": "1",
                  "filter:console_xbox-one": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "3",
                  "company_microsoft": "1",
                  "filter:condition_used": "4",
                  "filter:type_game": "4",
                  "filter:genre_platformer": "2",
                  "filter:genre_adventure": "1"
              }
          },
          "1708560000000": {
              "total": "200",
              "discounts": {},
              "collections": {
                  "psp-games": "2",
                  "ps3-games": "1"
              },
              "orders": "2",
              "day": "1708560000000",
              "products": {
                  "lego-batman-1-scratched-a-little": {
                      "val": "1",
                      "handle": "lego-batman-1-scratched-a-little",
                      "title": "Lego batman 1 (Scratched a little) "
                  },
                  "resistance-retribution": {
                      "val": "1",
                      "handle": "resistance-retribution",
                      "title": "resistance retribution"
                  },
                  "iron-man-game-only-": {
                      "val": "1",
                      "handle": "iron-man-game-only-",
                      "title": "Iron man ( Game Only )"
                  }
              },
              "tags": {
                  "filter:genre_kids": "1",
                  "filter:genre_quest": "1",
                  "filter:region_PAL": "1",
                  "filter:genre_fps": "1",
                  "filter:genre_action": "2",
                  "filter:region_NTSC": "2",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "2",
                  "filter:condition_cart": "1",
                  "filter:console_psp": "2",
                  "filter:condition_ok": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "3",
                  "filter:condition_used": "3",
                  "filter:condition_disc": "1",
                  "filter:type_game": "3"
              }
          },
          "1711238400000": {
              "total": "265",
              "discounts": {},
              "collections": {
                  "accessories": "4",
                  "wii-games": "1"
              },
              "orders": "2",
              "day": "1711238400000",
              "products": {
                  "wii-motion-plus-black": {
                      "val": "1",
                      "handle": "wii-motion-plus-black",
                      "title": "Wii motion plus (BLACK)"
                  },
                  "wii-remote-oem-black": {
                      "val": "1",
                      "handle": "wii-remote-oem-black",
                      "title": "Wii remote Oem (BLACK)"
                  },
                  "wii-remote-motion-plus-silicon-protector-black": {
                      "val": "1",
                      "handle": "wii-remote-motion-plus-silicon-protector-black",
                      "title": "Wii remote + motion plus  Silicon protector (BLACK)"
                  },
                  "wii-nunchuck-not-oem-white": {
                      "val": "1",
                      "handle": "wii-nunchuck-not-oem-white",
                      "title": "Wii nunchuck Oem (Black)"
                  },
                  "guitar-hero-3-legends-of-rock": {
                      "val": "1",
                      "handle": "guitar-hero-3-legends-of-rock",
                      "title": "Guitar hero 3 legends of rock "
                  }
              },
              "tags": {
                  "filter:type_accessory": "4",
                  "filter:region_PAL": "1",
                  "filter:genre_arcade": "1",
                  "company_nintendo": "4",
                  "filter:console_wii": "5",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "1",
                  "filter:condition_used": "5",
                  "filter:type_game": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "5",
                  "filter:genre_phantasy": "1"
              }
          },
          "1711152000000": {
              "total": "355",
              "discounts": {},
              "collections": {
                  "gameboy-original-games": "1",
                  "ps4-games": "1",
                  "ps1-games": "2"
              },
              "orders": "2",
              "day": "1711152000000",
              "products": {
                  "dmc-hd-collection-ps4": {
                      "val": "1",
                      "handle": "dmc-hd-collection-ps4",
                      "title": "Dmc Hd collection Ps4"
                  },
                  "tomb-raider-3-poor": {
                      "val": "1",
                      "handle": "tomb-raider-3-poor",
                      "title": "tomb raider 3"
                  },
                  "medal-of-honor-underground": {
                      "val": "1",
                      "handle": "medal-of-honor-underground",
                      "title": "medal of honor underground"
                  },
                  "contra-operation-c-game-only": {
                      "val": "1",
                      "handle": "contra-operation-c-game-only",
                      "title": "Contra operation c (Game only) "
                  }
              },
              "tags": {
                  "filter:region_PAL": "3",
                  "company_nintendo": "1",
                  "filter:genre_fps": "2",
                  "filter:genre_action": "4",
                  "filter:region_NTSC": "1",
                  "filter:condition_no-manual": "2",
                  "filter:condition_complete": "1",
                  "filter:console_ps4": "1",
                  "filter:console_ps1": "2",
                  "filter:condition_like-new": "3",
                  "filter:condition_cart": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "3",
                  "filter:condition_used": "4",
                  "filter:type_game": "4",
                  "filter:console_gameboy": "1",
                  "filter:condition_poor": "1",
                  "filter:genre_platformer": "1"
              }
          },
          "1711497600000": {
              "total": "80",
              "discounts": {},
              "collections": {
                  "gameboy-advance-games": "1"
              },
              "orders": "1",
              "day": "1711497600000",
              "products": {
                  "pacman-collection-game-only-": {
                      "val": "1",
                      "handle": "pacman-collection-game-only-",
                      "title": "Pacman collection (Game Only)"
                  }
              },
              "tags": {
                  "filter:console_gba": "1",
                  "company_nintendo": "1",
                  "filter:condition_used": "1",
                  "filter:region_NTSC": "1",
                  "filter:type_game": "1",
                  "filter:condition_like-new": "1",
                  "filter:condition_cart": "1",
                  "filter:genre_adventure": "1"
              }
          },
          "1706227200000": {
              "total": "170",
              "discounts": {
                  "bulk-ps2-selected-3-for-100": "1"
              },
              "collections": {
                  "ps2-games": "3",
                  "xbox-360-original-og": "1",
                  "discount-bulk-ps2-selected-3-for-100": "3"
              },
              "orders": "1",
              "day": "1706227200000",
              "products": {
                  "gran-turismo-4-platinum": {
                      "val": "1",
                      "handle": "gran-turismo-4-platinum",
                      "title": "gran turismo 4 (platinum)"
                  },
                  "black": {
                      "val": "1",
                      "handle": "black",
                      "title": "Black "
                  },
                  "midnight-club-xbox360-french-version": {
                      "val": "1",
                      "handle": "midnight-club-xbox360-french-version",
                      "title": "Midnight club French version "
                  },
                  "twisted-metal-black": {
                      "val": "1",
                      "handle": "twisted-metal-black",
                      "title": "Twisted metal black "
                  }
              },
              "tags": {
                  "filter:region_PAL": "4",
                  "filter:genre_fps": "1",
                  "filter:condition_no-manual": "1",
                  "filter:condition_complete": "3",
                  "filter:console_ps2": "3",
                  "filter:genre_AAA": "1",
                  "filter:condition_ok": "3",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "3",
                  "filter:condition_used": "4",
                  "company_microsoft": "1",
                  "filter:type_game": "4",
                  "filter:genre_driving": "2",
                  "filter:console_xbox-360": "1",
                  "filter:condition_poor": "1",
                  "filter:genre_adventure": "1"
              }
          },
          "1712275200000": {
              "total": "510",
              "discounts": {},
              "collections": {
                  "psp-games": "1",
                  "nintendo-gamecube-games": "1",
                  "gameboy-advance-games": "1",
                  "ps3-games": "2"
              },
              "orders": "2",
              "day": "1712275200000",
              "products": {
                  "star-wars-revenge-of-the-sith-gameboy-advance-game-only-": {
                      "val": "1",
                      "handle": "star-wars-revenge-of-the-sith-gameboy-advance-game-only-",
                      "title": "Star wars revenge of the sith Gameboy Advance (Game Only)"
                  },
                  "god-of-war-ghost-of-sparta": {
                      "val": "1",
                      "handle": "god-of-war-ghost-of-sparta",
                      "title": "god of war ghost of sparta"
                  },
                  "game-of-thrones": {
                      "val": "1",
                      "handle": "game-of-thrones",
                      "title": "Game of thrones "
                  },
                  "spacemarine-warhammer": {
                      "val": "1",
                      "handle": "spacemarine-warhammer",
                      "title": "Spacemarine warhammer "
                  },
                  "nba-street-v3": {
                      "val": "1",
                      "handle": "nba-street-v3",
                      "title": "nba street v3"
                  }
              },
              "tags": {
                  "filter:genre_sports": "2",
                  "filter:region_PAL": "2",
                  "company_nintendo": "2",
                  "filter:genre_action": "2",
                  "filter:region_NTSC": "3",
                  "filter:console_ps3": "2",
                  "filter:condition_complete": "4",
                  "filter:condition_like-new": "3",
                  "filter:condition_cart": "1",
                  "filter:console_psp": "1",
                  "filter:condition_new": "1",
                  "filter:console_gba": "1",
                  "filter:condition_ok": "1",
                  "company_sony": "3",
                  "filter:condition_used": "4",
                  "filter:type_game": "5",
                  "filter:genre_phantasy": "1",
                  "filter:genre_adventure": "2",
                  "filter:console_gamecube": "1"
              }
          },
          "1709683200000": {
              "total": 1489.1,
              "discounts": {
                  "order-above-299": "1",
                  "wushtok": "1"
              },
              "collections": {
                  "gameboy-original-games": "1",
                  "nintendo-switch-games": "1",
                  "limited-run-games": "1",
                  "dreamcast-games": "4",
                  "ps3-games": "1"
              },
              "orders": "1",
              "day": "1709683200000",
              "products": {
                  "call-of-juarez-bound-to-blood-ps3": {
                      "val": "1",
                      "handle": "call-of-juarez-bound-to-blood-ps3",
                      "title": "Call of juarez bound to blood Ps3 "
                  },
                  "sonic-adventure": {
                      "val": "1",
                      "handle": "sonic-adventure",
                      "title": "sonic adventure"
                  },
                  "cannon-spike": {
                      "val": "1",
                      "handle": "cannon-spike",
                      "title": "cannon spike"
                  },
                  "dead-or-alive-2-dreamcast": {
                      "val": "1",
                      "handle": "dead-or-alive-2-dreamcast",
                      "title": "Dead or alive 2 Dreamcast"
                  },
                  "soul-calibur": {
                      "val": "1",
                      "handle": "soul-calibur",
                      "title": "soul calibur"
                  },
                  "infernax-lrg-switch": {
                      "val": "1",
                      "handle": "infernax-lrg-switch",
                      "title": "Infernax LRG switch"
                  },
                  "kirby-s-block-ball-game-and-manual-only": {
                      "val": "1",
                      "handle": "kirby-s-block-ball-game-and-manual-only",
                      "title": "Kirby's block ball (Game and manual only) "
                  }
              },
              "tags": {
                  "filter:console_dreamcast": "4",
                  "filter:genre_fighting": "1",
                  "filter:genre_quest": "1",
                  "filter:region_PAL": "2",
                  "company_nintendo": "2",
                  "filter:console_switch": "1",
                  "company_limited-run-games": "1",
                  "filter:genre_action": "4",
                  "filter:region_NTSC": "5",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "6",
                  "filter:condition_cart": "1",
                  "filter:condition_like-new": "5",
                  "collection:type_games": "1",
                  "filter:condition_new": "1",
                  "condition_good": "1",
                  "company_sega": "4",
                  "company_sony": "1",
                  "filter:condition_used": "6",
                  "filter:type_game": "7",
                  "filter:console_gameboy": "1",
                  "filter:genre_platformer": "2",
                  "filter:condition_manual": "1",
                  "filter:genre_adventure": "1"
              }
          },
          "1707350400000": {
              "total": "470",
              "discounts": {
                  "order-above-299": "1"
              },
              "collections": {
                  "nintendo-gamecube-games": "1",
                  "ps3-games": "1"
              },
              "orders": "2",
              "day": "1707350400000",
              "products": {
                  "metal-gear-solid-the-twin-snakes": {
                      "val": "1",
                      "handle": "metal-gear-solid-the-twin-snakes",
                      "title": "Metal gear solid the twin snakes"
                  },
                  "nba-2k13": {
                      "val": "1",
                      "handle": "nba-2k13",
                      "title": "nba 2k13"
                  }
              },
              "tags": {
                  "filter:genre_sports": "1",
                  "company_nintendo": "1",
                  "filter:genre_action": "1",
                  "filter:region_NTSC": "1",
                  "filter:console_ps3": "1",
                  "filter:condition_no-manual": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "1",
                  "filter:genre_AAA": "1",
                  "filter:condition_ok": "1",
                  "filter:condition_scratched-disc": "1",
                  "company_sony": "1",
                  "filter:condition_used": "1",
                  "filter:genre_puzzle": "1",
                  "filter:type_game": "2",
                  "filter:console_gamecube": "1"
              }
          },
          "1706572800000": {
              "total": "115",
              "discounts": {},
              "collections": {
                  "ps3-games": "1"
              },
              "orders": "1",
              "day": "1706572800000",
              "products": {
                  "sonic-unleashed-ntsc-cib": {
                      "val": "1",
                      "handle": "sonic-unleashed-ntsc-cib",
                      "title": "Sonic unleashed (Ntsc) CiB"
                  }
              },
              "tags": {
                  "filter:genre_metroidvania": "1",
                  "filter:genre_quest": "1",
                  "company_sony": "1",
                  "filter:region_NTSC": "1",
                  "filter:type_game": "1",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "1"
              }
          },
          "1706918400000": {
              "total": "200",
              "discounts": {},
              "collections": {
                  "xbox-360-original-og": "1"
              },
              "orders": "1",
              "day": "1706918400000",
              "products": {
                  "gta-double-pack-xbox-og": {
                      "val": "1",
                      "handle": "gta-double-pack-xbox-og",
                      "title": "grand theft auto double pack"
                  }
              },
              "tags": {
                  "filter:region_PAL": "1",
                  "filter:condition_ok": "1",
                  "filter:genre_action": "1",
                  "filter:condition_used": "1",
                  "company_microsoft": "1",
                  "filter:type_game": "1",
                  "filter:condition_complete": "1",
                  "filter:console_xbox-original": "1",
                  "filter:genre_AAA": "1"
              }
          },
          "1709164800000": {
              "total": "225",
              "discounts": {},
              "collections": {
                  "ps2-games": "3"
              },
              "orders": "1",
              "day": "1709164800000",
              "products": {
                  "dragon-ball-z-budokai-2": {
                      "val": "1",
                      "handle": "dragon-ball-z-budokai-2",
                      "title": "Dragon ball z budokai 2"
                  },
                  "tekken-5": {
                      "val": "1",
                      "handle": "tekken-5",
                      "title": "Tekken 5 "
                  },
                  "tmnt-ps2": {
                      "val": "1",
                      "handle": "tmnt-ps2",
                      "title": "Tmnt Ps2 "
                  }
              },
              "tags": {
                  "filter:genre_fighting": "2",
                  "filter:region_PAL": "3",
                  "company_sony": "3",
                  "filter:genre_action": "1",
                  "filter:condition_used": "3",
                  "filter:type_game": "3",
                  "filter:condition_complete": "2",
                  "filter:condition_no-manual": "1",
                  "filter:condition_like-new": "3",
                  "filter:console_ps2": "3",
                  "filter:genre_multi-player": "1"
              }
          },
          "1712620800000": {
              "total": "270",
              "discounts": {},
              "collections": {
                  "ps3-games": "1"
              },
              "orders": "1",
              "day": "1712620800000",
              "products": {
                  "siren-blood-curse": {
                      "val": "1",
                      "handle": "siren-blood-curse",
                      "title": "Siren blood curse"
                  }
              },
              "tags": {
                  "filter:region_PAL": "1",
                  "filter:genre_horror": "1",
                  "company_sony": "1",
                  "filter:condition_used": "1",
                  "filter:type_game": "1",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "1"
              }
          },
          "1708905600000": {
              "total": "330",
              "discounts": {
                  "order-above-299": "1"
              },
              "collections": {
                  "ps2-games": "1",
                  "accessories": "2"
              },
              "orders": "1",
              "day": "1708905600000",
              "products": {
                  "shdow-hearts-from-the-new-world": {
                      "val": "1",
                      "handle": "shdow-hearts-from-the-new-world",
                      "title": "Shadow hearts from the new world "
                  },
                  "ps2-controller-dualshock": {
                      "val": "1",
                      "handle": "ps2-controller-dualshock",
                      "title": "Ps2 controller Dualshock "
                  },
                  "ps2-oem-memory-card": {
                      "val": "2",
                      "handle": "ps2-oem-memory-card",
                      "title": "PS2 Oem memory card"
                  }
              },
              "tags": {
                  "filter:type_accessory": "2",
                  "filter:region_PAL": "1",
                  "filter:genre_rpg": "1",
                  "company_sony": "3",
                  "filter:condition_used": "3",
                  "filter:accessory_memory": "1",
                  "menuitem:type_accessories": "1",
                  "filter:type_game": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_like-new": "3",
                  "filter:console_ps2": "3"
              }
          },
          "1710633600000": {
              "total": "700",
              "discounts": {
                  "bulk-ps2-selected-3-for-100": "1"
              },
              "collections": {
                  "gameboy-original-games": "1",
                  "ps2-games": "3",
                  "accessories": "1",
                  "nintendo-gamecube-games": "3",
                  "ps3-games": "1"
              },
              "orders": "3",
              "day": "1710633600000",
              "products": {
                  "timesplitters-2": {
                      "val": "1",
                      "handle": "timesplitters-2",
                      "title": "Timesplitters 2 "
                  },
                  "kingdom-hearts-2": {
                      "val": "1",
                      "handle": "kingdom-hearts-2",
                      "title": "Kingdom hearts 2"
                  },
                  "kingdom-hearts-1": {
                      "val": "1",
                      "handle": "kingdom-hearts-1",
                      "title": "Kingdom hearts 1 "
                  },
                  "viewtiful-joe-players-choice": {
                      "val": "1",
                      "handle": "viewtiful-joe-players-choice",
                      "title": "Viewtiful joe (Players choice)"
                  },
                  "super-dragon-ball-z": {
                      "val": "1",
                      "handle": "super-dragon-ball-z",
                      "title": "Super dragon ball z"
                  },
                  "hdmi-adapter-retro": {
                      "val": "1",
                      "handle": "hdmi-adapter-retro",
                      "title": "Hdmi adapter Retro "
                  },
                  "super-monkey-ball-2-player-s-choice-": {
                      "val": "1",
                      "handle": "super-monkey-ball-2-player-s-choice-",
                      "title": "super monkey ball 2 (player's choice)"
                  },
                  "chessmaster-1-gameboy-game-only-": {
                      "val": "1",
                      "handle": "chessmaster-1-gameboy-game-only-",
                      "title": "Chessmaster 1 Gameboy (Game Only)"
                  },
                  "dragon-ball-z-burstlimit": {
                      "val": "1",
                      "handle": "dragon-ball-z-burstlimit",
                      "title": "Dragon ball z burstlimit "
                  }
              },
              "tags": {
                  "filter:genre_fighting": "2",
                  "filter:type_accessory": "1",
                  "filter:genre_quest": "2",
                  "company_nintendo": "6",
                  "filter:genre_action": "2",
                  "filter:region_NTSC": "6",
                  "filter:condition_like-new": "7",
                  "company_sega": "1",
                  "filter:condition_ok": "1",
                  "company_sony": "4",
                  "filter:condition_used": "8",
                  "filter:type_game": "8",
                  "filter:console_gameboy": "1",
                  "filter:genre_platformer": "1",
                  "filter:genre_adventure": "2",
                  "filter:console_gamecube": "3",
                  "filter:genre_sports": "1",
                  "filter:region_PAL": "2",
                  "filter:console_ps3": "1",
                  "filter:condition_complete": "7",
                  "filter:condition_cart": "1",
                  "filter:console_ps2": "4",
                  "filter:genre_j-rpg": "2",
                  "filter:genre_multi-player": "1",
                  "filter:genre_arcade": "1",
                  "filter:condition_scratched-disc": "3",
                  "company_microsoft": "1",
                  "filter:accessory_other": "1",
                  "filter:genre_phantasy": "1"
              }
          },
          "1712793600000": {
              "products": {
                  "super-mario-galaxy-nintendo-selects-": {
                      "handle": "super-mario-galaxy-nintendo-selects-",
                      "val": "1",
                      "title": "super mario galaxy (nintendo selects)"
                  },
                  "wii-motion-plus-white": {
                      "handle": "wii-motion-plus-white",
                      "val": "1",
                      "title": "Wii motion plus (WHITE)"
                  }
              },
              "collections": {
                  "wii-games": "1",
                  "accessories": "1"
              },
              "tags": {
                  "filter:type_game": "1",
                  "filter:region_PAL": "1",
                  "company_nintendo": "1",
                  "filter:console_wii": "2",
                  "filter:condition_like-new": "2",
                  "filter:genre_adventure": "1",
                  "filter:genre_AAA": "1",
                  "filter:genre_platformer": "1",
                  "filter:condition_used": "2",
                  "company_sony": "1",
                  "filter:type_accessory": "1"
              },
              "discounts": {},
              "total": "140",
              "orders": "1",
              "day": "1712793600000"
          },
          "1712880000000": {
              "products": {
                  "spongebob-squarepants-volume-1-game-only": {
                      "handle": "spongebob-squarepants-volume-1-game-only",
                      "val": "1",
                      "title": "Spongebob squarepants volume 1 (Game only) "
                  },
                  "guitar-hero-on-tour-ds": {
                      "handle": "guitar-hero-on-tour-ds",
                      "val": "1",
                      "title": "guitar hero on tour ds"
                  }
              },
              "collections": {
                  "gameboy-advance-games": "1",
                  "nintendo-ds-games": "1"
              },
              "tags": {
                  "company_nintendo": "2",
                  "filter:condition_cart": "2",
                  "filter:condition_like-new": "2",
                  "filter:condition_used": "2",
                  "filter:type_game": "2",
                  "filter:region_NTSC": "1",
                  "filter:genre_platformer": "1",
                  "filter:genre_kids": "1",
                  "filter:console_gba": "1",
                  "filter:region_PAL": "1",
                  "filter:genre_adventure": "1",
                  "filter:genre_music": "1",
                  "filter:genre_party": "1",
                  "filter:console_ds": "1"
              },
              "discounts": {},
              "total": "200",
              "orders": "1",
              "day": "1712880000000"
          },
          "1712966400000": {
              "products": {
                  "wii-ntsc": {
                      "handle": "wii-ntsc",
                      "val": "1",
                      "title": "Wii NTSC "
                  },
                  "gran-turismo-5-platinum-": {
                      "handle": "gran-turismo-5-platinum-",
                      "val": "1",
                      "title": "gran turismo 5 (platinum)"
                  },
                  "gta-v": {
                      "handle": "gta-v",
                      "val": "1",
                      "title": "Gta v "
                  }
              },
              "collections": {
                  "consoles": "1",
                  "ps3-games": "2"
              },
              "tags": {
                  "company_nintendo": "1",
                  "filter:condition_like-new": "1",
                  "filter:condition_used": "3",
                  "filter:type_console": "1",
                  "filter:region_NTSC": "1",
                  "filter:console_wii": "1",
                  "company_sony": "2",
                  "filter:region_PAL": "2",
                  "filter:type_game": "2",
                  "filter:console_ps3": "2",
                  "filter:genre_AAA": "1",
                  "filter:genre_sports": "1",
                  "filter:condition_poor": "1",
                  "filter:condition_no-manual": "1",
                  "filter:genre_racing": "1",
                  "filter:condition_complete": "1",
                  "filter:condition_ok": "1",
                  "filter:genre_action": "1"
              },
              "discounts": {
                  "order-above-299": "1"
              },
              "total": "375",
              "orders": "1",
              "day": "1712966400000"
          }
      }
  },
  "fromDay": "1705190400000",
  "toDay": "1713052799999",
  "updatedAt": "1713022089040"
}

export default class Statistics  {
  /** @type {StorecraftAdminSDK} */
  #sdk;
  /** @type {Record<string, any>} */
  #cache = {};

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    this.#sdk = sdk
  }

  /**
   * Get the count of documents in a query of a collection
   * @param {string} colId collection ID
   * @param {string[]} search Array of search terms
   */
  countOf = (colId, search=[]) => {
    return 5;
    // let q = {}
    // if (Array.isArray(search) && search.length)
    //   q.where = [ ['search', 'array-contains-any', search] ]

    // return this.db.col(colId).count(q)
  }

  /** @returns {boolean} */
  isCacheValid = key => {
    return false;
    // return this.cache[key] && 
    // (Date.now()-this.cache[key].updatedAt)<HOUR
  }

  /**
   * 
   * @param {string} key 
   * @returns {import('@storecraft/core/v-api').StatisticsType}
   */
  fromCache = (key) => {
    if(this.isCacheValid(key))
      return this.#cache[key]
    return undefined
  }

  /**
   * 
   * @param {string} key 
   * @param {import('@storecraft/core/v-api').StatisticsType} value
   */
  putCache = (key, value) => {
    this.#cache[key] = value
  }


  /**
   * Load `statistics`
   * 
   * @param {string | number | Date} [from_day] `ISO` string | `UTC` | `timestamp` | `Date`
   * @param {string | number | Date} [to_day] `ISO` string | `UTC` | `timestamp` | `Date`
   * 
   * @returns {Promise<import('@storecraft/core/v-api').StatisticsType>}
   */
  get = async (from_day, to_day) => {
    const search = new URLSearchParams();

    if(from_day)
      search.set('fromDay', from_day.toString());
    if(to_day)
      search.set('toDay', to_day.toString());

    return fetchApiWithAuth(
      `statistics?${search.toString()}`
    );
  }


}