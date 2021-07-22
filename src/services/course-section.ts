import request from '@/utils/request';

export const getSectionAndLesson = (courseId: string | number) => request({
  method: 'GET',
  url: '/boss/course/section/getSectionAndLesson',
  params: {
    courseId,
  },
});

export const saveOrUpdateSection = (data: any) => request({
  method: 'POST',
  url: '/boss/course/section/saveOrUpdateSection',
  data,
});

export const getSectionById = (sectionId: string | number) => request({
  method: 'GET',
  url: '/boss/course/section/getBySectionId',
  params: {
    sectionId,
  },
});
