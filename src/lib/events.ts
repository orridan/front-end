/** Window events shared between the main bundle and lazy chunks. */
export const ROUTE_CHANGE_EVENT = 'orridan:route-change';
export const OPEN_CHAT_EVENT = 'orridan:open-chat';

export function openChat() {
  window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
}
