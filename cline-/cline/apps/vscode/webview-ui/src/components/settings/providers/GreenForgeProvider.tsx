import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

export const GreenForgeProvider = () => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	return (
		<div>
			<ApiKeyField
				initialValue={(apiConfiguration as any)?.greenforgeApiKey || apiConfiguration?.geminiApiKey || ""}
				onChange={(value) => handleFieldChange("greenforgeApiKey" as any, value)}
				providerName="GreenForge (Gemini Key)"
				signupUrl="https://aistudio.google.com/apikey"
			/>
            <p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", marginTop: 0 }}>
                A chave do Gemini é usada para alimentar os agentes do debate. Se estiver em branco, tentará usar a chave do Gemini configurada.
            </p>

            <div style={{ marginTop: "15px" }}>
                <VSCodeTextField
                    value={(apiConfiguration as any)?.greenforgeFlashModel || "gemini-2.5-flash"}
                    onInput={(e: any) => handleFieldChange("greenforgeFlashModel" as any, e.target?.value)}
                    placeholder="gemini-2.5-flash"
                    style={{ width: "100%" }}>
                    <span style={{ fontWeight: 500 }}>Modelo Flash (Propositor e Crítico)</span>
                </VSCodeTextField>
            </div>

            <div style={{ marginTop: "15px" }}>
                <VSCodeTextField
                    value={(apiConfiguration as any)?.greenforgeProModel || "gemini-2.5-pro"}
                    onInput={(e: any) => handleFieldChange("greenforgeProModel" as any, e.target?.value)}
                    placeholder="gemini-2.5-pro"
                    style={{ width: "100%" }}>
                    <span style={{ fontWeight: 500 }}>Modelo Pro (Árbitro)</span>
                </VSCodeTextField>
            </div>

            <div style={{ marginTop: "15px" }}>
                <VSCodeTextField
                    value={((apiConfiguration as any)?.greenforgeMaxRounds || 3).toString()}
                    onInput={(e: any) => handleFieldChange("greenforgeMaxRounds" as any, parseInt(e.target?.value) || 3)}
                    placeholder="3"
                    style={{ width: "100%" }}>
                    <span style={{ fontWeight: 500 }}>Máximo de Rounds de Debate</span>
                </VSCodeTextField>
            </div>
		</div>
	)
}
