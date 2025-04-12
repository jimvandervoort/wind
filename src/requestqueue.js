export class RequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.currentRequest = null;
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const request = this.queue[0];

    try {
      if (this.currentRequest) {
        this.currentRequest.abort();
      }
      this.currentRequest = new AbortController();
      const response = await request.apiCall({ signal: this.currentRequest.signal });

      if (!response.ok) {
        throw new Error('Request failed');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      console.error('Request failed:', error);
    } finally {
      this.queue.shift();
      this.isProcessing = false;
      this.currentRequest = null;
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }

  add(apiCall) {
    this.queue.push({ apiCall });
    this.process();
  }
}
