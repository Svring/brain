"use client";

import { assign, createMachine } from "xstate";

export interface ProjectContext {}

export type ProjectEvent = { type: "ENTER_PROJECT" } | { type: "EXIT_PROJECT" };

export const projectMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7AVmAxgFwDoALdAWzGQEMYBiAUQDkAVOgJQH0AFVgeQCk6AYSYBtAAwBdRCnSwAlnjnoAdtJAAPRACYAbAFYCATi0BGABwB2LWYAsAZkM2TdgDQgAntr0mCFsXZMtC1szE0NQnQBfSLc0LFxCEnIqWgBlOiZ2AAkeAFk6TgBBAHE6dgARQqZC8SkkEGRZBSVVes0EczFfMQsArRsxMz1bZzdPDoJ-EJstO0H-LS0xPWjYjGx8AgAzABt0AHdi1EpkInoADQBJTO5+IVFJNUb5RRU1dustAmtAmZMxcw6JxjbQA77+ZzeOaGHp6OyrBrrBLbPaHY6nGjpTIAMQAMjwAOrsYqsQqcLIVKo1R71Z7NN5tRA2GyGAh6HT9cL9YJ2HQ6VweRCOAi-QyGHS2MVmaUrBHKdAQOBPJH4J5NV6tUAfHQEGy2Oy9OxDAaOUaChAAWjMOpsOhM3gBATtcwsCLiG0SZAo1DAapeLXeiAsNl1+sNxrEppBHTMX0McOcWj0w1m9q0bpVhF2ByOJyIfvpmo0TMMPhMFnFsbChgscLh0bCBj0wUTWlLYjt0ui0SAA */
  types: {} as { context: ProjectContext; events: ProjectEvent },
  id: "project",
  initial: "",
  context: {},
  states: {},
});
