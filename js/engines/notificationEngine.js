export function createInAppNotification(type, message) {
  return {
    id: `${type}-${Date.now()}`,
    type,
    message,
    createdAt: new Date().toISOString(),
    read: false
  };
}
