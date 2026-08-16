import { supabase } from '@/lib/supabase';
import ProjectShowcase, { Project } from '@/components/ProjectShowcase';

// บังคับให้โหลดข้อมูลใหม่เสมอเมื่อมีการอัปเดตผ่านหน้า Admin
export const revalidate = 0;

async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data as Project[];
}

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen w-full bg-white text-neutral-900 selection:bg-neutral-200 selection:text-neutral-900 antialiased">
      <ProjectShowcase projects={projects} />
    </main>
  );
}