import { Provider } from "starknet";
import { DeploymentError, DeploymentErrorType, RetryConfig, Networks } from "../types";

class Logger {
    private formatMessage(level: string, message: any): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] ${level}: ${typeof message === 'string' ? message : JSON.stringify(message)}`;
    }

    info(message: any): void {
        console.log(this.formatMessage('INFO', message));
    }

    warn(message: any): void {
        console.warn(this.formatMessage('WARN', message));
    }

    error(message: any): void {
        console.error(this.formatMessage('ERROR', message));
    }
}

export const logger = new Logger();

const defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    factor: 2
};

export async function withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = defaultRetryConfig,
    context: string
): Promise<T> {
    let delay = config.initialDelay;
    let attempt = 0;

    while (attempt < config.maxAttempts) {
        try {
            return await operation();
        } catch (error: any) {
            attempt++;

            const errorType = classifyStarknetError(error);
            logger.warn({
                message: `Retry attempt ${attempt}/${config.maxAttempts} for ${context}`,
                error: error.message,
                type: errorType
            });

            if (attempt === config.maxAttempts || !isRetryableError(errorType)) {
                throw new DeploymentError(errorType, error.message);
            }

            await sleep(delay);
            delay = Math.min(delay * config.factor, config.maxDelay);
        }
    }

    throw new DeploymentError(
        DeploymentErrorType.UNKNOWN_ERROR,
        `Max retry attempts (${config.maxAttempts}) reached for ${context}`
    );
}

function classifyStarknetError(error: any): DeploymentErrorType {
    const errorMsg = error.message.toLowerCase();

    if (errorMsg.includes("insufficient max fee")) {
        return DeploymentErrorType.GAS_ERROR;
    }
    if (errorMsg.includes("invalid transaction nonce")) {
        return DeploymentErrorType.NONCE_ERROR;
    }
    if (errorMsg.includes("network") || errorMsg.includes("timeout")) {
        return DeploymentErrorType.NETWORK_ERROR;
    }
    if (errorMsg.includes("contract") || errorMsg.includes("class hash")) {
        return DeploymentErrorType.CONTRACT_ERROR;
    }
    if (errorMsg.includes("invalid") || errorMsg.includes("validation")) {
        return DeploymentErrorType.VALIDATION_ERROR;
    }
    return DeploymentErrorType.UNKNOWN_ERROR;
}

function isRetryableError(errorType: DeploymentErrorType): boolean {
    return [
        DeploymentErrorType.NETWORK_ERROR,
        DeploymentErrorType.GAS_ERROR,
        DeploymentErrorType.NONCE_ERROR
    ].includes(errorType);
}

export async function validateNetwork(provider: Provider): Promise<void> {
    try {
        await provider.getChainId();
    } catch (error) {
        throw new DeploymentError(
            DeploymentErrorType.NETWORK_ERROR,
            "Failed to validate network connection"
        );
    }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));