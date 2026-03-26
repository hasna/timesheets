#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  createProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
  logTime,
  getEntry,
  listEntries,
  updateEntry,
  deleteEntry,
  getProjectSummary,
  getWeeklySummary,
  getClientSummary,
} from "../db/timesheets.js";
import {
  getCountryDefaults,
  listSupportedCountries,
  getSetting,
  setSetting,
  getAllSettings,
  checkOvertimeStatus,
} from "../db/locale.js";

const server = new McpServer({
  name: "timesheets",
  version: "0.1.0",
});

// ─── Projects ────────────────────────────────────────────────────────────────

server.registerTool(
  "create_project",
  {
    title: "Create Project",
    description: "Create a new project for time tracking.",
    inputSchema: {
      name: z.string(),
      client: z.string().optional(),
      hourly_rate: z.number().optional(),
      budget_hours: z.number().optional(),
      status: z.enum(["active", "completed", "archived"]).optional(),
      currency: z.string().optional(),
      country: z.string().optional(),
    },
  },
  async (params) => {
    const project = createProject(params);
    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
    };
  }
);

server.registerTool(
  "get_project",
  {
    title: "Get Project",
    description: "Get a project by ID.",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const project = getProject(id);
    if (!project) {
      return {
        content: [{ type: "text", text: `Project '${id}' not found.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
    };
  }
);

server.registerTool(
  "list_projects",
  {
    title: "List Projects",
    description: "List projects with optional filters.",
    inputSchema: {
      status: z.string().optional(),
      client: z.string().optional(),
      limit: z.number().optional(),
    },
  },
  async (params) => {
    const projects = listProjects(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ projects, count: projects.length }, null, 2),
        },
      ],
    };
  }
);

server.registerTool(
  "update_project",
  {
    title: "Update Project",
    description: "Update an existing project.",
    inputSchema: {
      id: z.string(),
      name: z.string().optional(),
      client: z.string().optional(),
      hourly_rate: z.number().optional(),
      budget_hours: z.number().optional(),
      status: z.enum(["active", "completed", "archived"]).optional(),
      currency: z.string().optional(),
      country: z.string().optional(),
      overtime_rate_multiplier: z.number().optional(),
      max_daily_hours: z.number().optional(),
      max_weekly_hours: z.number().optional(),
    },
  },
  async ({ id, ...input }) => {
    const project = updateProject(id, input);
    if (!project) {
      return {
        content: [{ type: "text", text: `Project '${id}' not found.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
    };
  }
);

server.registerTool(
  "delete_project",
  {
    title: "Delete Project",
    description: "Delete a project and all its time entries.",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const deleted = deleteProject(id);
    return {
      content: [{ type: "text", text: JSON.stringify({ id, deleted }) }],
    };
  }
);

// ─── Time Entries ────────────────────────────────────────────────────────────

server.registerTool(
  "log_time",
  {
    title: "Log Time",
    description: "Log a time entry for a project.",
    inputSchema: {
      project_id: z.string(),
      description: z.string(),
      hours: z.number(),
      date: z.string().optional(),
      billable: z.boolean().optional(),
      overtime: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
    },
  },
  async (params) => {
    const entry = logTime(params);
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    };
  }
);

server.registerTool(
  "get_entry",
  {
    title: "Get Time Entry",
    description: "Get a time entry by ID.",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const entry = getEntry(id);
    if (!entry) {
      return {
        content: [{ type: "text", text: `Entry '${id}' not found.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    };
  }
);

server.registerTool(
  "list_entries",
  {
    title: "List Time Entries",
    description: "List time entries with optional filters.",
    inputSchema: {
      project_id: z.string().optional(),
      from_date: z.string().optional(),
      to_date: z.string().optional(),
      billable: z.boolean().optional(),
      limit: z.number().optional(),
    },
  },
  async (params) => {
    const entries = listEntries(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ entries, count: entries.length }, null, 2),
        },
      ],
    };
  }
);

server.registerTool(
  "update_entry",
  {
    title: "Update Time Entry",
    description: "Update an existing time entry.",
    inputSchema: {
      id: z.string(),
      project_id: z.string().optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      hours: z.number().optional(),
      billable: z.boolean().optional(),
      overtime: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
    },
  },
  async ({ id, ...input }) => {
    const entry = updateEntry(id, input);
    if (!entry) {
      return {
        content: [{ type: "text", text: `Entry '${id}' not found.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    };
  }
);

server.registerTool(
  "delete_entry",
  {
    title: "Delete Time Entry",
    description: "Delete a time entry by ID.",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const deleted = deleteEntry(id);
    return {
      content: [{ type: "text", text: JSON.stringify({ id, deleted }) }],
    };
  }
);

// ─── Summaries ───────────────────────────────────────────────────────────────

server.registerTool(
  "project_summary",
  {
    title: "Project Summary",
    description:
      "Get project summary with total hours, billable hours, and total value.",
    inputSchema: { project_id: z.string() },
  },
  async ({ project_id }) => {
    const summary = getProjectSummary(project_id);
    if (!summary) {
      return {
        content: [
          { type: "text", text: `Project '${project_id}' not found.` },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
    };
  }
);

server.registerTool(
  "weekly_summary",
  {
    title: "Weekly Summary",
    description: "Get weekly summary with hours by day.",
    inputSchema: { week_start: z.string() },
  },
  async ({ week_start }) => {
    const summary = getWeeklySummary(week_start);
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
    };
  }
);

server.registerTool(
  "client_summary",
  {
    title: "Client Summary",
    description: "Get summary of hours and value grouped by client.",
    inputSchema: {},
  },
  async () => {
    const summaries = getClientSummary();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { summaries, count: summaries.length },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ─── Locale ───────────────────────────────────────────────────────────────────

server.registerTool(
  "list_countries",
  {
    title: "List Countries",
    description:
      "List all supported countries with their labor law defaults (currency, max hours, overtime rates).",
    inputSchema: {},
  },
  async () => {
    const countries = listSupportedCountries();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { countries, count: countries.length },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.registerTool(
  "get_country_defaults",
  {
    title: "Get Country Defaults",
    description:
      "Get labor law defaults for a specific country (currency, max daily/weekly hours, overtime multiplier).",
    inputSchema: { country: z.string() },
  },
  async ({ country }) => {
    const defaults = getCountryDefaults(country);
    return {
      content: [{ type: "text", text: JSON.stringify(defaults, null, 2) }],
    };
  }
);

server.registerTool(
  "check_overtime",
  {
    title: "Check Overtime Status",
    description:
      "Check if given daily/weekly hours exceed limits for a country.",
    inputSchema: {
      daily_hours: z.number(),
      weekly_hours: z.number(),
      country: z.string(),
    },
  },
  async ({ daily_hours, weekly_hours, country }) => {
    const result = checkOvertimeStatus(daily_hours, weekly_hours, country);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "get_settings",
  {
    title: "Get Settings",
    description: "Get all timesheet settings (locale, currency, date format).",
    inputSchema: {},
  },
  async () => {
    const settings = getAllSettings();
    return {
      content: [{ type: "text", text: JSON.stringify(settings, null, 2) }],
    };
  }
);

server.registerTool(
  "set_setting",
  {
    title: "Set Setting",
    description: "Set a timesheet setting value.",
    inputSchema: {
      key: z.string(),
      value: z.string(),
    },
  },
  async ({ key, value }) => {
    setSetting(key, value);
    const saved = getSetting(key);
    return {
      content: [
        { type: "text", text: JSON.stringify({ key, value: saved }) },
      ],
    };
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("timesheets MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
