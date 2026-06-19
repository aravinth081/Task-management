import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  writeBatch
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAQnKKbaZODEsyPvS9Pm5QnSSvmK0sCnbg",
  authDomain: "task-management-2c4a8.firebaseapp.com",
  projectId: "task-management-2c4a8",
  storageBucket: "task-management-2c4a8.firebasestorage.app",
  messagingSenderId: "118391646031",
  appId: "1:118391646031:web:15773ed699a6a28fdb073a",
  measurementId: "G-R0GDC909RV"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ─── Database Seeder ─────────────────────────────────
export const seedDatabaseIfEmpty = async () => {
  try {
    const projectsCol = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsCol);

    if (!projectsSnapshot.empty) {
      console.log('🔥 Firestore database is already seeded.');
      return;
    }

    console.log('🌱 Seeding Firestore database...');
    const batch = writeBatch(db);

    // 1. Seed Projects
    const projectsData = [
      {
        id: 'project-1',
        name: 'E-Commerce Platform',
        key: 'ECP',
        description: 'Full-stack e-commerce with payments, inventory, and shipping',
        status: 'ACTIVE',
        priority: 'HIGH',
        color: '#2563EB',
        taskCount: 5,
        completedTaskCount: 2,
        memberCount: 5,
        dueDate: 'Jun 30, 2026',
        starred: true,
        members: [
          { id: '1', name: 'Sarah Kim' },
          { id: '2', name: 'Mike Rodriguez' },
          { id: '3', name: 'Lisa Morgan' },
          { id: '4', name: 'John Davis' },
          { id: '5', name: 'Amy Wilson' }
        ]
      },
      {
        id: 'project-2',
        name: 'Mobile App v2.0',
        key: 'MAV',
        description: 'React Native rebuild with new UI and offline support',
        status: 'ACTIVE',
        priority: 'CRITICAL',
        color: '#A78BFA',
        taskCount: 3,
        completedTaskCount: 0,
        memberCount: 3,
        dueDate: 'Jul 15, 2026',
        starred: true,
        members: [
          { id: '1', name: 'Tom Chen' },
          { id: '2', name: 'Anna Bell' },
          { id: '3', name: 'Chris Park' }
        ]
      },
      {
        id: 'project-3',
        name: 'Marketing Website',
        key: 'MKT',
        description: 'New landing pages and SEO optimization',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        color: '#22C55E',
        taskCount: 1,
        completedTaskCount: 1,
        memberCount: 2,
        dueDate: 'Jun 10, 2026',
        starred: false,
        members: [
          { id: '1', name: 'Diana Ross' },
          { id: '2', name: 'Eric Hu' }
        ]
      }
    ];

    projectsData.forEach((project) => {
      const docRef = doc(db, 'projects', project.id);
      batch.set(docRef, project);
    });

    // 2. Seed Tasks
    const tasksData = [
      { id: 't1', number: 101, projectId: 'project-1', title: 'Research competitor analytics features', status: 'BACKLOG', priority: 'LOW', project: 'E-Commerce Platform', projectKey: 'ECP', dueDate: 'Jun 15', assignees: [{ id: '1', name: 'Sarah Kim' }], comments: 2, attachments: 0, labels: [{ name: 'Research', color: '#A78BFA' }], storyPoints: 3 },
      { id: 't2', number: 102, projectId: 'project-1', title: 'Create wireframes for settings page', status: 'BACKLOG', priority: 'MEDIUM', dueDate: 'Jun 12', assignees: [{ id: '2', name: 'Mike R.' }], comments: 0, attachments: 1, labels: [{ name: 'Design', color: '#EC4899' }], storyPoints: 5 },
      { id: 't3', number: 103, projectId: 'project-1', title: 'Implement user authentication API', status: 'TODO', priority: 'HIGH', dueDate: 'Jun 8', assignees: [{ id: '3', name: 'Lisa Morgan' }, { id: '4', name: 'John Davis' }], comments: 5, attachments: 2, labels: [{ name: 'Backend', color: '#22C55E' }, { name: 'Auth', color: '#F59E0B' }], storyPoints: 8 },
      { id: 't4', number: 104, projectId: 'project-1', title: 'Setup Stripe payment integration', status: 'TODO', priority: 'CRITICAL', dueDate: 'Jun 6', assignees: [{ id: '1', name: 'Sarah Kim' }], comments: 8, attachments: 3, labels: [{ name: 'Backend', color: '#22C55E' }, { name: 'Payments', color: '#EF4444' }], storyPoints: 13 },
      { id: 't5', number: 105, projectId: 'project-1', title: 'Design notification system UI', status: 'TODO', priority: 'MEDIUM', assignees: [{ id: '5', name: 'Amy Wilson' }], comments: 1, attachments: 0, labels: [{ name: 'Design', color: '#EC4899' }], storyPoints: 5 },
      { id: 't6', number: 106, projectId: 'project-1', title: 'Build Kanban board drag & drop', description: 'Implement full drag and drop with real-time sync', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: 'Jun 5', assignees: [{ id: '3', name: 'Lisa Morgan' }], comments: 12, attachments: 1, labels: [{ name: 'Frontend', color: '#2563EB' }, { name: 'Feature', color: '#60A5FA' }], storyPoints: 8 },
      { id: 't7', number: 107, projectId: 'project-1', title: 'Implement real-time WebSocket events', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: 'Jun 7', assignees: [{ id: '4', name: 'John Davis' }, { id: '1', name: 'Sarah Kim' }], comments: 6, attachments: 0, labels: [{ name: 'Backend', color: '#22C55E' }], storyPoints: 8 },
      { id: 't8', number: 108, projectId: 'project-1', title: 'Dashboard analytics widgets', status: 'IN_REVIEW', priority: 'MEDIUM', assignees: [{ id: '5', name: 'Amy Wilson' }, { id: '2', name: 'Mike R.' }], comments: 4, attachments: 2, labels: [{ name: 'Frontend', color: '#2563EB' }], storyPoints: 5 },
      { id: 't9', number: 109, projectId: 'project-1', title: 'User profile CRUD operations', status: 'TESTING', priority: 'LOW', assignees: [{ id: '3', name: 'Lisa Morgan' }], comments: 3, attachments: 0, labels: [{ name: 'Backend', color: '#22C55E' }, { name: 'Testing', color: '#F97316' }], storyPoints: 3 },
      { id: 't10', number: 110, projectId: 'project-1', title: 'Project setup & scaffolding', status: 'COMPLETED', priority: 'HIGH', assignees: [{ id: '1', name: 'Sarah Kim' }], comments: 2, attachments: 1, labels: [{ name: 'DevOps', color: '#14B8A6' }], storyPoints: 3 },
      { id: 't11', number: 111, projectId: 'project-1', title: 'Design system & theme tokens', status: 'COMPLETED', priority: 'MEDIUM', assignees: [{ id: '5', name: 'Amy Wilson' }], comments: 7, attachments: 4, labels: [{ name: 'Design', color: '#EC4899' }], storyPoints: 5 },
      
      { id: 't12', number: 201, projectId: 'project-2', title: 'Initialize React Native project', status: 'TODO', priority: 'HIGH', project: 'Mobile App v2.0', projectKey: 'MAV', dueDate: 'Jun 20', assignees: [{ id: '1', name: 'Tom Chen' }], comments: 0, attachments: 0, labels: [], storyPoints: 5 },
      { id: 't13', number: 202, projectId: 'project-2', title: 'Configure Redux store', status: 'IN_PROGRESS', priority: 'MEDIUM', project: 'Mobile App v2.0', projectKey: 'MAV', dueDate: 'Jun 25', assignees: [{ id: '2', name: 'Anna Bell' }], comments: 1, attachments: 0, labels: [], storyPoints: 3 },
      { id: 't14', number: 203, projectId: 'project-2', title: 'Offline sync logic', status: 'TODO', priority: 'CRITICAL', project: 'Mobile App v2.0', projectKey: 'MAV', dueDate: 'Jul 5', assignees: [{ id: '3', name: 'Chris Park' }], comments: 4, attachments: 1, labels: [], storyPoints: 13 },
      
      { id: 't15', number: 301, projectId: 'project-3', title: 'SEO audit and fix headings', status: 'COMPLETED', priority: 'MEDIUM', project: 'Marketing Website', projectKey: 'MKT', dueDate: 'Jun 5', assignees: [{ id: '1', name: 'Diana Ross' }], comments: 2, attachments: 0, labels: [], storyPoints: 2 }
    ];

    tasksData.forEach((task) => {
      const docRef = doc(db, 'tasks', task.id);
      batch.set(docRef, task);
    });

    // 3. Seed Activities
    const activitiesData = [
      { id: 'act-1', user: 'Sarah K.', action: 'completed task', target: 'Design user authentication flow', time: new Date(Date.now() - 2 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'act-2', user: 'Mike R.', action: 'commented on', target: 'API rate limiting implementation', time: new Date(Date.now() - 8 * 60 * 1000).toISOString(), type: 'info' },
      { id: 'act-3', user: 'Lisa M.', action: 'moved task to In Review', target: 'Dashboard analytics widgets', time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), type: 'warning' },
      { id: 'act-4', user: 'John D.', action: 'created project', target: 'Mobile App v2.0', time: new Date(Date.now() - 32 * 60 * 1000).toISOString(), type: 'info' },
      { id: 'act-5', user: 'Amy W.', action: 'assigned task to', target: 'Mike R. — Database migration script', time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), type: 'default' }
    ];

    activitiesData.forEach((activity) => {
      const docRef = doc(db, 'activities', activity.id);
      batch.set(docRef, activity);
    });

    await batch.commit();
    console.log('✅ Firestore database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding Firestore database:', error);
  }
};
