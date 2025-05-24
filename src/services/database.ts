class DatabaseService {
  private static instance: DatabaseService;
  private db: IDBDatabase | null = null;
  private dbName = 'patientRegistrationDB';
  private storeName = 'patients';
  private version = 1;

  private constructor() {
    this.initDB();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('firstName', 'firstName', { unique: false });
          store.createIndex('lastName', 'lastName', { unique: false });
          store.createIndex('email', 'email', { unique: false });
          store.createIndex('phone', 'phone', { unique: false });
        }
      };
    });
  }

  private async waitForDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    await this.initDB();
    return this.db!;
  }

  public async addPatient(patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email?: string;
    phone?: string;
    address?: string;
  }): Promise<void> {
    const db = await this.waitForDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add({
        ...patient,
        createdAt: new Date().toISOString(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to add patient'));
    });
  }

  public async getPatients(): Promise<any[]> {
    const db = await this.waitForDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const patients = request.result;
        patients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(patients);
      };

      request.onerror = () => reject(new Error('Failed to get patients'));
    });
  }

  public async searchPatients(searchTerm: string): Promise<any[]> {
    const db = await this.waitForDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const patients = request.result;
        const searchTermLower = searchTerm.toLowerCase();
        const filteredPatients = patients.filter((patient) => {
          return (
            patient.firstName.toLowerCase().includes(searchTermLower) ||
            patient.lastName.toLowerCase().includes(searchTermLower) ||
            (patient.email && patient.email.toLowerCase().includes(searchTermLower)) ||
            (patient.phone && patient.phone.toLowerCase().includes(searchTermLower))
          );
        });
        filteredPatients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(filteredPatients);
      };

      request.onerror = () => reject(new Error('Failed to search patients'));
    });
  }
}

export const db = DatabaseService.getInstance(); 