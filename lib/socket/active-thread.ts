let currentActiveThreadId: string | null = null;

export function setActiveThreadId(id: string | null): void {
  currentActiveThreadId = id;
}

export function getActiveThreadId(): string | null {
  return currentActiveThreadId;
}
