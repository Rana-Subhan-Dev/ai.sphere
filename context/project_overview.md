# Airis Product Overview

## 🌬️ What is Airis?

**Airis** is a next-generation interface for human-computer interaction — a hybrid between a **thinking companion**, a **smart operating system**, and a **visual browser for intelligence**.

It is designed around structured, contextual, and interactive data. Users navigate and interact with **spaces** of knowledge, tasks, tools, agents, and applications through a spatial visual metaphor called the **Vortex** — a dynamic interface that serves as portal/window to the user's Airis and that maps and connects everything the user cares about.

---

## 🧠 Core Philosophy

- **Agentic-first**: The user is assisted by a powerful AI agent that understands their goals, context, and preferences.
- **Contextual UI**: Instead of apps or folders, users move through **Spheres**, which are contextual environments containing structured objects, tools, workflows, and memory.
- **Visual Intelligence**: Information is represented spatially, interactively, and beautifully — making intelligence feel tactile, alive, and composable.

---

## 🌀 The Vortex

The **Vortex** is the primary user interface. It is a spatial, portal to the user’s world and the web — both personal and professional – through which users can view their Airis' Elements (Globe, Cortex, Agent)

Think of it as a window with a **3D globe** where each **node** is a **Sphere** — a structured, intelligent container of knowledge, work, tools, and AI memory.

### 🌍 The Globe

The **Globe** is the sphere with a canvas, inside the Vortex. It serves as the **map of the user's mind and environment**, showing all active or important Spheres.

- The Globe is zoomable, pannable, and rotatable.
- Users can **pinch to zoom in/out**, **click to enter a Sphere**, and **drag to reorganize**.
- Layout can follow semantic clusters, timelines, work/life boundaries, or AI-generated organization.

### 🪐 Spheres

A **Sphere** is a smart, contextual container. Each Sphere can represent a:

- **Project** (e.g. “Startup X Design”)
- **Area of Life** (e.g. “Health”, “Family”)
- **Knowledge Graph** (e.g. “AI Concepts”)
- **Workflow or App** (e.g. “Writing Sphere”, “Dev Tracker”)

Each Sphere contains:

- **Structured Objects** (Notes, Docs, People, Tools, Goals)
- **Native or SDK Apps**
- **Chat Thread with the Agent (optional)**
- **Interactive View Modes**: grid, list, canvas, timeline, etc.
- **Actions & Automations** tied to the Sphere

Think of Spheres as **living folders**, **contextual apps**, and **intelligent notebooks**, all in one.

### 🖥️ Spaces

**Spaces** are the **UI inside a Sphere**. A Space is the visual and interactive environment the user works within.

Types of Spaces:

- **Desktop Space**: App-like layout, productivity-focused (sidebars, split panes).
- **Canvas Space**: Freeform, node-based layout for brainstorming and mapping.
- **Explorer Space**: Browser-style view for navigating structured data or the web.
- **Timeline Space**: Chronological interface for journaling, logs, tracking.

Spaces are **configurable**, **AI-extendable**, and **user-modifiable**.

---

## 🔩 Native Elements

The following elements are composable across Spheres and Spaces:

### Objects

- **Notes / Docs**: Markdown or rich text blocks
- **Links / Bookmarks**: Structured web metadata
- **People**: Contacts with semantic attributes and relationships
- **Media**: Images, videos, recordings, embeds
- **Knowledge**: Structured entries from the user’s graph (concepts, tags, definitions)

### Tools & Apps

- **Native Apps**: Built-in utilities (Task Manager, Calendar, Graph View)
- **SDK Apps**: Third-party or user-created tools loaded via the Airis SDK

Apps are always **contextualized** within a Sphere, and their data is scoped accordingly.

---

## ⚙️ Cortex (No UI Yet)

The **Cortex** is the structured, persistent memory and context engine behind Airis.

- Stores all Spheres, objects, timelines, and relationships
- Powers search, summarization, and understanding
- Feeds real-time context to the Agent

We won’t render or build direct UI for the Cortex yet — it's backend only.

---

## 👤 Agent (No UI Yet)

The **Airis Agent** is the user’s AI co-pilot:

- Understands active Spheres, goals, preferences
- Can perform actions, retrieve info, summarize, plan, build
- Accesses tools, triggers automations, and proposes workflows

It exists through voice, chat, and API interactions — UI is deferred until core Vortex is complete.

---

## 🧩 How It All Connects

```plaintext
        VORTEX
          |
       [Globe]
          |
     ┌────────────┐
     |   Sphere   |
     └────────────┘
          |
       [Space]
          |
┌─────────┬─────────┐
| Objects |  Apps   |
└─────────┴─────────┘

Each Sphere can have multiple Spaces (views), and each Space renders structured objects or apps/tools inside.

---

### 🛠️ Dev Priorities (Frontend)

## Vortex (Globe UI):

- Spatial layout

- Hover/zoom/click interactions

- Custom clustering or semantic organization

## Sphere UI:

- Metadata & context panel

- Object rendering (notes, people, links, tasks)

- Space switching

## Spaces:

- Modular rendering engine (grid, canvas, explorer)

- Drag & drop support

- Widget or tool injection

## State:

- Persistent Sphere states

- Session memory

- Globe ↔ Sphere ↔ Space transitions

## Design Language:

- Clean, elegant, fluid

- Semantic colors & icons

- Typographic hierarchy & motion

- Apple-esque microinteractions