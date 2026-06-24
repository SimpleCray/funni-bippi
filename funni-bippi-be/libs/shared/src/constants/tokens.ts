/**
 * Dependency-injection tokens.
 *
 * Used as the `name` in `ClientsModule.register([{ name: KAFKA_CLIENT, ... }])`
 * and to resolve it with `@Inject(KAFKA_CLIENT)`. Both sides MUST use this
 * symbol — never a raw string — so a typo fails at compile time, not runtime.
 */
export const KAFKA_CLIENT = 'KAFKA_CLIENT';
