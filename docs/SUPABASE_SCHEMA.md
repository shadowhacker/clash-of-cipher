# Supabase Schema for Dhyanam Game Config

## Table: game_config
| Column      | Type      | Description                                      |
|------------|-----------|--------------------------------------------------|
| id         | uuid      | Primary key (auto-generated)                     |
| key        | text      | Config key (e.g., 'rules_text', 'referral_text') |
| value      | jsonb     | Config value (string, number, or JSON)           |
| updated_at | timestamp | Last update timestamp (default: now())           |

**Example Rows:**
| key             | value                                                                 |
|-----------------|-----------------------------------------------------------------------|
| rules_text      | ["1. Watch the symbols and remember their order.", "2. Tap the symbols in the same order.", "3. Get it right to go to the next round!"] |
| referral_text   | "Invite your friends and get rewards!"                                |
| default_timer   | 5                                                                     |
| icon_flash_time | {"easy": [1.5, 2.0], "hard": [1.2, 1.5]}                              |

---

## Table: round_logic
| Column      | Type      | Description                                 |
|-------------|-----------|---------------------------------------------|
| id          | uuid      | Primary key                                 |
| level_start | int4      | Start of level range                        |
| level_end   | int4      | End of level range                          |
| icon_count  | jsonb     | Number or range of icons for this bracket   |
| flash_time  | jsonb     | Flash time or range for this bracket        |
| randomization | jsonb   | Randomization rules (e.g., repeats allowed) |
| updated_at  | timestamp | Last update timestamp (default: now())      |

**Example Rows:**
| level_start | level_end | icon_count | flash_time     | randomization                |
|-------------|-----------|------------|---------------|------------------------------|
| 1           | 30        | [1,2]      | [1.5,2.0]     | {"repeat": true}             |
| 31          | 50        | [2,3]      | [1.2,1.5]     | {"repeat": true}             |
| 51          | 9999      | [3,4]      | [1.2,1.5]     | {"repeat": false}            |

---

## Usage
- Update these tables in the Supabase dashboard to change game logic, rules, or texts without redeploying the frontend.
- The frontend fetches these configs on load and uses them for all dynamic logic. 