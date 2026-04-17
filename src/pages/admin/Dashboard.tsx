import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { BriefcaseIcon, FileTextIcon, MessageSquareIcon, SettingsIcon, PlusIcon } from 'lucide-react';
import { useProjects } from '../../lib/hooks/useProjects';
import { useBlogPosts } from '../../lib/hooks/useBlogPosts';
import { useMessages } from '../../lib/hooks/useMessages';
import { useServices } from '../../lib/hooks/useServices';
import { Skeleton } from '../../components/ui/Skeleton';

export function Dashboard() {
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useProjects();
  const { posts, loading: postsLoading } = useBlogPosts();
  const { messages, loading: messagesLoading } = useMessages();
  const { services, loading: servicesLoading } = useServices();

  const isLoading = projectsLoading || postsLoading || messagesLoading || servicesLoading;
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;

  const stats = [
    { name: 'Total Projects', value: projects.length.toString(), icon: BriefcaseIcon, link: '/admin/projects' },
    { name: 'Blog Posts', value: posts.length.toString(), icon: FileTextIcon, link: '/admin/blog' },
    { name: 'Unread Messages', value: unreadMessagesCount.toString(), icon: MessageSquareIcon, link: '/admin/messages' },
    { name: 'Active Services', value: services.filter((s) => s.isVisible).length.toString(), icon: SettingsIcon, link: '/admin/services' },
  ];

  const recentActivity: { id: string; action: string; target: string; time: string }[] = [];
  messages.slice(0, 2).forEach((msg) => {
    recentActivity.push({
      id: `msg-${msg.id}`,
      action: msg.status === 'unread' ? 'New message received' : 'Message read',
      target: `from ${msg.name}`,
      time: msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Recently',
    });
  });
  posts.slice(0, 2).forEach((post) => {
    recentActivity.push({
      id: `post-${post.id}`,
      action: post.status === 'published' ? 'Published blog post' : 'Draft saved',
      target: `"${post.title}"`,
      time: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently',
    });
  });
  projects.slice(0, 2).forEach((proj) => {
    recentActivity.push({
      id: `proj-${proj.id}`,
      action: 'Project added',
      target: `"${proj.title}"`,
      time: proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : 'Recently',
    });
  });

  if (isLoading && projects.length === 0 && posts.length === 0 && messages.length === 0 && services.length === 0) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton variant="text" width={220} height={28} />
          <Skeleton variant="text" width={320} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-6 space-y-3">
              <Skeleton variant="circular" width={48} height={48} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" height={32} />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card padding="lg" className="lg:col-span-2 space-y-3">
            <Skeleton variant="text" width={180} />
            <Skeleton variant="text" lines={4} />
          </Card>
          <Card padding="lg" className="space-y-3">
            <Skeleton variant="text" width={140} />
            <Skeleton variant="text" lines={4} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-main">Dashboard Overview</h1>
        <p className="text-muted mt-1">Welcome back to your portfolio admin panel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="flex items-center p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => navigate(stat.link)}>
              <div className="p-3 rounded-lg bg-primary/10 text-primary mr-4">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">{stat.name}</p>
                <p className="text-2xl font-bold text-main">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card padding="lg" className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-main mb-6">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="text-main font-medium">
                      {activity.action} <span className="text-muted font-normal">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No recent activity. Start by adding projects, blog posts, or services.</p>
          )}
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-main mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" fullWidth className="justify-start gap-3" onClick={() => navigate('/admin/blog/new')}>
              <PlusIcon className="w-4 h-4" /> Create New Blog Post
            </Button>
            <Button variant="outline" fullWidth className="justify-start gap-3" onClick={() => navigate('/admin/projects')}>
              <PlusIcon className="w-4 h-4" /> Add New Project
            </Button>
            <Button variant="outline" fullWidth className="justify-start gap-3" onClick={() => navigate('/admin/services')}>
              <PlusIcon className="w-4 h-4" /> Manage Services
            </Button>
            <Button variant="outline" fullWidth className="justify-start gap-3" onClick={() => navigate('/admin/settings')}>
              <BriefcaseIcon className="w-4 h-4" /> Update Settings & CV
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
