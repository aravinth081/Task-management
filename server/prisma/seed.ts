import { PrismaClient, Role, Plan, Priority, TaskStatus, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing database records
  await prisma.activity.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.taskAssignee.deleteMany({});
  await prisma.taskLabel.deleteMany({});
  await prisma.label.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.sprint.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.workspaceMember.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.workspace.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing database records.');

  // 2. Hash default password
  const hashedPassword = await bcrypt.hash('password123', 12);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@taskflow.io',
      name: 'Sarah Kim',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  });

  const developer = await prisma.user.create({
    data: {
      email: 'dev@taskflow.io',
      name: 'Mike Rodriguez',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  });

  const designer = await prisma.user.create({
    data: {
      email: 'designer@taskflow.io',
      name: 'Lisa Morgan',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  });

  console.log('👤 Created demo users.');

  // 4. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Space Corporation',
      slug: 'acme-space-corp',
      plan: Plan.PRO,
    },
  });

  console.log('🏢 Created demo workspace.');

  // 5. Add Workspace Memberships
  await prisma.workspaceMember.create({
    data: { userId: admin.id, workspaceId: workspace.id, role: Role.SUPER_ADMIN },
  });
  await prisma.workspaceMember.create({
    data: { userId: developer.id, workspaceId: workspace.id, role: Role.MEMBER },
  });
  await prisma.workspaceMember.create({
    data: { userId: designer.id, workspaceId: workspace.id, role: Role.MEMBER },
  });

  // 6. Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Apollo Website Redesign',
      key: 'APO',
      description: 'Revamping the core Acme Space Corporation marketing site with interactive elements and high-performance metrics.',
      color: '#2563EB',
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      workspaceId: workspace.id,
      leadId: admin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Next-Gen Mobile App',
      key: 'MOB',
      description: 'Building a cross-platform React Native app for real-time telemetry tracking.',
      color: '#8B5CF6',
      status: ProjectStatus.ACTIVE,
      priority: Priority.MEDIUM,
      workspaceId: workspace.id,
      leadId: developer.id,
    },
  });

  console.log('📁 Created demo projects.');

  // 7. Add Project Members
  await prisma.projectMember.create({
    data: { projectId: project1.id, userId: admin.id, role: Role.SUPER_ADMIN },
  });
  await prisma.projectMember.create({
    data: { projectId: project1.id, userId: developer.id, role: Role.MEMBER },
  });
  await prisma.projectMember.create({
    data: { projectId: project1.id, userId: designer.id, role: Role.MEMBER },
  });

  await prisma.projectMember.create({
    data: { projectId: project2.id, userId: admin.id, role: Role.SUPER_ADMIN },
  });
  await prisma.projectMember.create({
    data: { projectId: project2.id, userId: developer.id, role: Role.SUPER_ADMIN },
  });

  // 8. Create Labels
  const labelBug = await prisma.label.create({
    data: { name: 'Bug', color: '#EF4444', projectId: project1.id },
  });
  const labelFeature = await prisma.label.create({
    data: { name: 'Feature', color: '#22C55E', projectId: project1.id },
  });
  const labelDesign = await prisma.label.create({
    data: { name: 'Design', color: '#A78BFA', projectId: project1.id },
  });

  // 9. Create Sprints
  const sprint1 = await prisma.sprint.create({
    data: {
      name: 'Apollo Sprint 1',
      goal: 'Launch the beta landing page and design layout structure.',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      projectId: project1.id,
    },
  });

  console.log('🏃 Created project sprints.');

  // 10. Create Tasks
  // Todo Task
  const task1 = await prisma.task.create({
    data: {
      number: 101,
      title: 'Design high-fidelity wireframes for homepage',
      description: 'Create landing page mockups showing the 3D orbit graphics and customer testimonial carousel. Ensure mobile responsiveness.',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      storyPoints: 5,
      position: 1000,
      projectId: project1.id,
      sprintId: sprint1.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  // In Progress Task
  const task2 = await prisma.task.create({
    data: {
      number: 102,
      title: 'Setup Express API server with Prisma models',
      description: 'Implement core REST API structure. Configure Prisma Client with PostgreSQL connection pool. Include healthcheck and basic error handling.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      storyPoints: 8,
      position: 1000,
      projectId: project1.id,
      sprintId: sprint1.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  // In Review Task
  const task3 = await prisma.task.create({
    data: {
      number: 103,
      title: 'Create GlassCard and custom UI badges',
      description: 'Build premium reusable glassmorphism components with TailwindCSS and Framer Motion micro-animations.',
      status: TaskStatus.IN_REVIEW,
      priority: Priority.MEDIUM,
      storyPoints: 3,
      position: 1000,
      projectId: project1.id,
      sprintId: sprint1.id,
      createdById: designer.id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
    },
  });

  // Completed Task
  const task4 = await prisma.task.create({
    data: {
      number: 104,
      title: 'Register project domains and configure DNS',
      description: 'Purchase domains and wire them to Cloudflare CDN. Configure SSL certs and caching rules.',
      status: TaskStatus.COMPLETED,
      priority: Priority.LOW,
      storyPoints: 1,
      position: 1000,
      projectId: project1.id,
      sprintId: sprint1.id,
      createdById: admin.id,
      completedAt: new Date(),
    },
  });

  console.log('✅ Created project tasks.');

  // 11. Add Task Assignees
  await prisma.taskAssignee.create({ data: { taskId: task1.id, userId: designer.id } });
  await prisma.taskAssignee.create({ data: { taskId: task2.id, userId: developer.id } });
  await prisma.taskAssignee.create({ data: { taskId: task3.id, userId: designer.id } });
  await prisma.taskAssignee.create({ data: { taskId: task4.id, userId: admin.id } });

  // 12. Add Task Labels
  await prisma.taskLabel.create({ data: { taskId: task1.id, labelId: labelDesign.id } });
  await prisma.taskLabel.create({ data: { taskId: task2.id, labelId: labelFeature.id } });
  await prisma.taskLabel.create({ data: { taskId: task3.id, labelId: labelDesign.id } });

  // 13. Create Comments & Activities
  const comment = await prisma.comment.create({
    data: {
      content: "These wireframes look incredible, Lisa! Can we make the hero call-to-action button slightly glow on hover?",
      taskId: task3.id,
      userId: admin.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Thanks Sarah! I've updated the button styling to use a vibrant electric blue shadow on hover. Let me know if that works.",
      taskId: task3.id,
      userId: designer.id,
      parentId: comment.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: 'moved task to In Review',
      entity: 'task',
      entityId: task3.id,
      userId: designer.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: 'completed task',
      entity: 'task',
      entityId: task4.id,
      userId: admin.id,
    },
  });

  console.log('💬 Seeded comments, tasks relationships, and activity feeds.');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
