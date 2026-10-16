import Hero from '../components/sections/Hero'
import SignInCard from '../components/sections/SignInCard'
import ChatSection from '../components/sections/ChatSection'
import QuickActions from '../components/sections/QuickActions'
import AdsSection from '../components/sections/AdsSection'
import MemberCard from '../components/sections/MemberCard'
import TasksSection from '../components/sections/TasksSection'
import WheelSection from '../components/sections/WheelSection'
import ShopSection from '../components/sections/ShopSection'
import BargainCard from '../components/sections/BargainCard'
import ShakeCard from '../components/sections/ShakeCard'
import RedPacketSection from '../components/sections/RedPacketSection'

/**
 * 桌面端（lg）：CSS Grid 网格区域布局，左 72% / 右 28%
 *   hero hero    signin
 *   chat chat    bargain
 *   quick quick  shake
 *   ads ads      member
 *   tasks tasks  redpacket
 *   wheel wheel  redpacket
 *   shop shop    redpacket
 * 移动端：flex 纵向 + order 排序（导航/Hero/对话/签到/砍一刀/摇一摇/广告/任务/转盘/商城/会员/红包雨）
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-20 md:px-6 md:pt-24">
      <div className="home-grid">
        <div className="area-hero order-1">
          <Hero />
        </div>
        <div className="area-chat order-2">
          <ChatSection />
        </div>
        <div className="area-quick order-2">
          <QuickActions />
        </div>
        <div className="area-signin order-3">
          <SignInCard />
        </div>
        <div className="area-bargain order-4">
          <BargainCard />
        </div>
        <div className="area-shake order-5">
          <ShakeCard />
        </div>
        <div className="area-ads order-6">
          <AdsSection />
        </div>
        <div className="area-tasks order-7">
          <TasksSection />
        </div>
        <div className="area-wheel order-8">
          <WheelSection />
        </div>
        <div className="area-shop order-8">
          <ShopSection />
        </div>
        <div className="area-member order-9">
          <MemberCard />
        </div>
        <div className="area-redpacket order-10 lg:self-stretch">
          <RedPacketSection />
        </div>
      </div>
    </div>
  )
}
