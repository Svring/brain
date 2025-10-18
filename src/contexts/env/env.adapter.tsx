"use client";

import { useMachine } from "@xstate/react";
import type { ReactNode } from "react";
import { envMachineContext } from "./env.context";
import type { EnvContext } from "./env.state";
import { envMachine } from "./env.state";

interface EnvAdapterProps {
	children: ReactNode;
	envContext: EnvContext;
}

export function EnvAdapter({ children, envContext }: EnvAdapterProps) {
	const [state, send] = useMachine(envMachine, {
		input: envContext,
	});

	// console.log('envContext', envContext)

	return (
		<envMachineContext.Provider
			value={{
				env: state.context,
				state,
				send,
			}}
		>
			{children}
		</envMachineContext.Provider>
	);
}
