export type ConnectionStatus= "connected" | "disconneted" | "pending"

export type ConnectionInfo={
    label: string,
    status: ConnectionStatus
};