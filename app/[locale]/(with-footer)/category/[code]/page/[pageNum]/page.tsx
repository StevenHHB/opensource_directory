/* eslint-disable react/jsx-props-no-spreading */
/* update */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/db/supabase/client';

import { RevalidateOneHour } from '@/lib/constants';

import Content from '../../Content';

export const revalidate = RevalidateOneHour * 6;

export async function generateMetadata({ params }: { params: { code: string; pageNum?: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: categoryList } = await supabase.from('navigation_category').select().eq('name', params.code);

  if (!categoryList || !categoryList[0]) {
    notFound();
  }

  return {
    title: categoryList[0].title,
  };
}

export default async function Page({ params }: { params: { code: string; pageNum?: string } }) {
  const supabase = createClient();
  const currentPage = Number(params?.pageNum || 1);

  const [{ data: categoryList }, { count }] = await Promise.all([
    supabase.from('navigation_category').select().eq('name', params.code),
    supabase
      .from('web_navigation')
      .select('*', { count: 'exact' })
      .eq('category_name', params.code),
  ]);

  if (!categoryList || !categoryList[0]) {
    notFound();
  }

  const { data: navigationList } = await supabase
    .from('web_navigation')
    .select('*')
    .eq('category_name', params.code)
    .range(0, count! - 1); // Fetch all results

  return (
    <Content
      headerTitle={categoryList[0]!.title || params.code}
      navigationList={navigationList!}
      currentPage={currentPage}
      total={count!}
      pageSize={count!} // Set pageSize to total count
      route={`/category/${params.code}`}
    />
  );
}
