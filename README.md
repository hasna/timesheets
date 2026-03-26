# @hasna/timesheets

Timesheet management for AI coding agents. Track projects, log time entries, and generate summaries — via CLI or MCP server backed by SQLite.

## Features

- **Projects**: create, update, delete, filter by status or client
- **Time entries**: log hours with billable/non-billable/overtime flags, tags, date ranges
- **Summaries**: project summaries, weekly breakdowns, client rollups
- **Locale support**: 12 countries with correct labor law defaults (overtime rates, max hours, currencies)
- **CLI** (`timesheets`) and **MCP server** (`timesheets-mcp`)
- SQLite storage at `~/.hasna/timesheets/timesheets.db`

## Installation

```bash
npm install -g @hasna/timesheets
# or
bun install -g @hasna/timesheets
```

## CLI Usage

```bash
# Projects
timesheets project add --name "Website Redesign" --client "Acme" --rate 150 --country RO
timesheets project list
timesheets project list --status active --client Acme
timesheets project get <id>
timesheets project update <id> --rate 175
timesheets project delete <id>

# Time Entries
timesheets log --project <id> --description "Built auth module" --hours 3.5
timesheets log --project <id> --description "Late work" --hours 2 --overtime
timesheets log --project <id> --description "Internal meeting" --hours 1 --no-billable
timesheets list --project <id> --from 2025-01-01 --to 2025-01-31
timesheets list --billable
timesheets get <entry-id>
timesheets update <entry-id> --hours 4
timesheets delete <entry-id>

# Summaries
timesheets project-summary <id>
timesheets weekly 2025-01-06
timesheets client-summary

# Locale
timesheets locale countries
timesheets locale country RO
timesheets locale overtime --daily 10 --weekly 45 --country RO
timesheets locale settings
timesheets locale set locale ro-RO
```

Add `--json` to any command to get JSON output.

## MCP Server

Configure in your Claude/agent settings:

```json
{
  "mcpServers": {
    "timesheets": {
      "command": "timesheets-mcp"
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `create_project` | Create a new project |
| `get_project` | Get project by ID |
| `list_projects` | List projects with filters |
| `update_project` | Update a project |
| `delete_project` | Delete a project |
| `log_time` | Log a time entry |
| `get_entry` | Get a time entry by ID |
| `list_entries` | List entries with filters |
| `update_entry` | Update a time entry |
| `delete_entry` | Delete a time entry |
| `project_summary` | Hours + value summary for a project |
| `weekly_summary` | Day-by-day breakdown for a week |
| `client_summary` | Rollup by client |
| `list_countries` | All supported countries |
| `get_country_defaults` | Labor law defaults for a country |
| `check_overtime` | Check overtime status |
| `get_settings` | All settings |
| `set_setting` | Update a setting |

## Data Storage

By default: `~/.hasna/timesheets/timesheets.db`

Override with environment variables:
- `HASNA_TIMESHEETS_DIR` — full path to directory
- `TIMESHEETS_DIR` — full path to directory

## Library Usage

```typescript
import {
  createProject,
  logTime,
  listEntries,
  getProjectSummary,
  getCountryDefaults,
} from "@hasna/timesheets";

const project = createProject({
  name: "My Project",
  client: "Client A",
  hourly_rate: 150,
  currency: "EUR",
  country: "DE",
});

const entry = logTime({
  project_id: project.id,
  description: "Initial development",
  hours: 4,
  billable: true,
});

const summary = getProjectSummary(project.id);
const roDefaults = getCountryDefaults("RO"); // { currency: "RON", overtime_multiplier: 1.75, ... }
```

## Supported Countries

RO, US, GB, DE, FR, NL, IT, ES, PL, HU, SE, BG

Each country includes: currency, locale, max daily/weekly hours, overtime rate multiplier, date format, and week start day.

## License

Apache-2.0
