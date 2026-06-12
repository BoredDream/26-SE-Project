import type { Achievement, Checkin, Location, User } from '@/services/api'

export interface Comment {
  id: number
  post_id: number
  user: Pick<User, 'id' | 'nickname' | 'avatar'>
  content: string
  created_at: string
}

export const mockUser: User = {
  id: 1,
  openid: 'demo_openid',
  nickname: '花园探索者',
  avatar: '',
  level: 8,
  exp: 1250,
  total_checkins: 47,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockLocations: Location[] = [
  {
    id: 1,
    name: '狮山樱花径',
    description: '沿着狮山的樱花小径，春天时粉色花海最适合打卡。',
    latitude: '30.4692',
    longitude: '114.3578',
    flower_species: '樱花',
    bloom_status: '盛开中',
    historical_bloom_start: '03月10日',
    historical_bloom_end: '03月25日',
    cover_image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=720&q=80',
    checkin_count: 68,
    status_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: '格桑花坡',
    description: '幸福之花格桑花随风摇曳，寓意吉祥美好。',
    latitude: '30.4703',
    longitude: '114.3634',
    flower_species: '格桑花',
    bloom_status: '预计7天开放',
    historical_bloom_start: '04月05日',
    historical_bloom_end: '04月20日',
    cover_image: 'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a5?auto=format&fit=crop&w=720&q=80',
    checkin_count: 39,
    status_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: '油菜花田',
    description: '金黄油菜花在阳光下铺展，春意盎然。',
    latitude: '30.4720',
    longitude: '114.3586',
    flower_species: '油菜花',
    bloom_status: '含苞待放',
    historical_bloom_start: '03月15日',
    historical_bloom_end: '04月05日',
    cover_image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=720&q=80',
    checkin_count: 22,
    status_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: '玉兰花园',
    description: '玉兰花洁白如玉，清香宜人，春日最早盛开的花之一。',
    latitude: '30.4680',
    longitude: '114.3601',
    flower_species: '玉兰花',
    bloom_status: '盛开中',
    historical_bloom_start: '03月01日',
    historical_bloom_end: '03月20日',
    cover_image: 'https://images.unsplash.com/photo-1495320521277-0f12c5c221c2?auto=format&fit=crop&w=720&q=80',
    checkin_count: 51,
    status_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: '梨花溪畔',
    description: '梨花如雪，清风过处花瓣飞舞，如诗如画。',
    latitude: '30.4710',
    longitude: '114.3625',
    flower_species: '梨花',
    bloom_status: '预计5天开放',
    historical_bloom_start: '03月20日',
    historical_bloom_end: '04月05日',
    cover_image: 'https://images.unsplash.com/photo-1464207551237-040338b17096?auto=format&fit=crop&w=720&q=80',
    checkin_count: 17,
    status_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: '大金鸡菊坡地',
    description: '大金鸡菊金黄色花朵覆盖山坡，夏日里分外耀眼。',
    latitude: '30.4698',
    longitude: '114.3612',
    flower_species: '大金鸡菊',
    bloom_status: '含苞待放',
    historical_bloom_start: '05月10日',
    historical_bloom_end: '06月30日',
    cover_image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc98?auto=format&fit=crop&w=720&q=80',
    checkin_count: 11,
    status_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const mockCheckins: Checkin[] = [
  {
    id: 101,
    user_id: 1,
    location_id: 1,
    content: '狮山樱花径的花海太美了，春风轻拂，心情格外舒畅。',
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=720&q=80'
    ],
    likes_count: 12,
    dislikes_count: 1,
    comments_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date().toISOString(),
    user: mockUser,
  },
  {
    id: 102,
    user_id: 2,
    location_id: 4,
    content: '牡丹园的色彩层次非常丰富，拍照出来的效果很高级。',
    images: [
      'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=720&q=80'
    ],
    likes_count: 23,
    dislikes_count: 0,
    comments_count: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      id: 2,
      openid: 'user_2',
      nickname: '花间一壶酒',
      avatar: '',
      level: 5,
      exp: 890,
      total_checkins: 18,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 103,
    user_id: 3,
    location_id: 2,
    content: '百合小角落准备开花了，空气中能闻到一丝清香。',
    images: [],
    likes_count: 8,
    dislikes_count: 0,
    comments_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      id: 3,
      openid: 'user_3',
      nickname: '绿叶边',
      avatar: '',
      level: 4,
      exp: 610,
      total_checkins: 14,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 104,
    user_id: 4,
    location_id: 3,
    content: '向日葵田逐渐展开了，远看像一片金黄的海洋。',
    images: [
      'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=720&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=720&q=80'
    ],
    likes_count: 26,
    dislikes_count: 2,
    comments_count: 9,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      id: 4,
      openid: 'user_4',
      nickname: '秋水伊人',
      avatar: '',
      level: 6,
      exp: 1020,
      total_checkins: 24,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 105,
    user_id: 1,
    location_id: 5,
    content: '兰花苑开始显露花苞，颜色柔和，非常适合静心。',
    images: ['https://images.unsplash.com/photo-1597987335282-a5dd4a6c4569?auto=format&fit=crop&w=720&q=80'],
    likes_count: 5,
    dislikes_count: 0,
    comments_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    updated_at: new Date().toISOString(),
    user: mockUser,
  }
]

const u2 = { id: 2, nickname: '花间一壶酒', avatar: '' }
const u3 = { id: 3, nickname: '绿叶边', avatar: '' }
const u4 = { id: 4, nickname: '秋水伊人', avatar: '' }
const u5 = { id: 5, nickname: '春风十里', avatar: '' }
const u6 = { id: 6, nickname: '山间清泉', avatar: '' }

const ago = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString()

export const mockComments: Comment[] = [
  // Post 101 — 3条
  { id: 1, post_id: 101, user: u2, content: '太美了！春天的樱花径每年都要来一次。', created_at: ago(25) },
  { id: 2, post_id: 101, user: u3, content: '这个角度拍出来真好看，下次带相机去。', created_at: ago(60) },
  { id: 3, post_id: 101, user: u4, content: '花瓣飘落的时候最有意境了。', created_at: ago(180) },

  // Post 102 — 6条
  { id: 4, post_id: 102, user: u3, content: '玉兰花园的光线真的很好！', created_at: ago(30) },
  { id: 5, post_id: 102, user: u5, content: '白色花瓣看着很清净，心情舒畅。', created_at: ago(90) },
  { id: 6, post_id: 102, user: u6, content: '这个打卡地点加入收藏了，计划下周去。', created_at: ago(150) },
  { id: 7, post_id: 102, user: u2, content: '牡丹和玉兰哪个先开呀？', created_at: ago(240) },
  { id: 8, post_id: 102, user: u4, content: '花香飘得很远，路过就能闻到。', created_at: ago(360) },
  { id: 9, post_id: 102, user: u3, content: '好想去！最近天气这么好正是时候。', created_at: ago(480) },

  // Post 103 — 2条
  { id: 10, post_id: 103, user: u5, content: '格桑花坡的视野真的很开阔。', created_at: ago(45) },
  { id: 11, post_id: 103, user: u6, content: '幸福之花，名字就很美。', created_at: ago(200) },

  // Post 104 — 9条
  { id: 12, post_id: 104, user: u2, content: '油菜花田金灿灿的，每年都过来看。', created_at: ago(20) },
  { id: 13, post_id: 104, user: u3, content: '这片油菜花好像比去年大了一圈！', created_at: ago(55) },
  { id: 14, post_id: 104, user: u5, content: '蜜蜂特别多，空气里都是花蜜香。', created_at: ago(100) },
  { id: 15, post_id: 104, user: u6, content: '拍照的时候注意逆光，效果更好。', created_at: ago(180) },
  { id: 16, post_id: 104, user: u4, content: '下次早点去，人少光线也好。', created_at: ago(260) },
  { id: 17, post_id: 104, user: u2, content: '带娃去玩，孩子特别开心！', created_at: ago(380) },
  { id: 18, post_id: 104, user: u3, content: '花期还有多久呀？想约朋友来。', created_at: ago(500) },
  { id: 19, post_id: 104, user: u5, content: '停车方便吗？打算自驾过去。', created_at: ago(620) },
  { id: 20, post_id: 104, user: u6, content: '记得带防晒，太阳有点晒。', created_at: ago(720) },

  // Post 105 — 1条
  { id: 21, post_id: 105, user: u4, content: '梨花开了！清香真的很宜人。', created_at: ago(70) },
]

export const mockAchievements: Achievement[] = [
  { id: 1, name: '初次打卡', description: '完成一次花卉打卡', icon: '一', requirement: 1, reward_exp: 20 },
  { id: 2, name: '花园探索者', description: '完成5次打卡', icon: '二', requirement: 5, reward_exp: 40 },
  { id: 3, name: '内容创作者', description: '发布3条帖子', icon: '三', requirement: 3, reward_exp: 60 },
  { id: 4, name: '打卡达人', description: '完成20次打卡', icon: '四', requirement: 20, reward_exp: 120 },
]
