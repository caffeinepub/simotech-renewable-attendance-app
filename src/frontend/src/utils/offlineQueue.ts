interface QueueItem {
  type: 'checkIn' | 'checkOut';
  data: any;
  timestamp: number;
}

const QUEUE_KEY = 'attendance_offline_queue';

export function getOfflineQueue(): QueueItem[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to read offline queue:', error);
    return [];
  }
}

export function addToOfflineQueue(item: QueueItem): void {
  try {
    const queue = getOfflineQueue();
    queue.push(item);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to add to offline queue:', error);
  }
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear offline queue:', error);
  }
}

