import { ApiConfiguration } from "../../../shared/api"
import { ApiHandler, buildApiHandler } from "../index"

export interface GreenForgeAgents {
	proposer: ApiHandler
	critic: ApiHandler
	arbiter: ApiHandler
}

export function createAgents(config: ApiConfiguration): GreenForgeAgents {
	// O provedor GreenForge atua como um orquestrador, mas os agentes utilizam o Gemini por baixo dos panos.
	// Sobrescrevemos o provider para "gemini" e injetamos a chave e os modelos corretos.
	const flashModel = config.greenforgeFlashModel || "gemini-2.5-flash"
	const proModel = config.greenforgeProModel || "gemini-2.5-pro"
	// Podemos reusar a chave do Gemini se a específica do GreenForge não estiver configurada
	const apiKey = (config as any).greenforgeApiKey || config.geminiApiKey

	const proposerConfig: ApiConfiguration = {
		...config,
		actModeApiProvider: "gemini",
		geminiApiKey: apiKey,
		actModeApiModelId: flashModel,
	}

	const criticConfig: ApiConfiguration = {
		...config,
		actModeApiProvider: "gemini",
		geminiApiKey: apiKey,
		actModeApiModelId: flashModel,
	}

	const arbiterConfig: ApiConfiguration = {
		...config,
		actModeApiProvider: "gemini",
		geminiApiKey: apiKey,
		actModeApiModelId: proModel,
	}

	return {
		proposer: buildApiHandler(proposerConfig, "act"),
		critic: buildApiHandler(criticConfig, "act"),
		arbiter: buildApiHandler(arbiterConfig, "act"),
	}
}
