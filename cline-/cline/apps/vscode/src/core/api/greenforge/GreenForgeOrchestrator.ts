import { Anthropic } from "@anthropic-ai/sdk"
import { ApiConfiguration } from "../../../shared/api"
import { ApiHandler, ApiHandlerModel } from "../index"
import { ApiStream } from "../transform/stream"

export class GreenForgeApiHandler implements ApiHandler {
	constructor(private options: ApiConfiguration) {}

	createMessage(
		systemPrompt: string, 
		messages: Anthropic.Messages.MessageParam[], 
		tools?: any[]
	): ApiStream {
		throw new Error("GreenForgeApiHandler is an orchestrator and does not use createMessage directly.")
	}

	getModel(): ApiHandlerModel {
		return {
			id: "greenforge",
			info: {
				name: "GreenForge (Debate Adversarial)",
				supportsPromptCache: false,
			} as any
		}
	}

	getConfig(): ApiConfiguration {
		return this.options
	}
}
