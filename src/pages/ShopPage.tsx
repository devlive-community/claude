import ShopSection from '../components/sections/ShopSection'
import MemberCard from '../components/sections/MemberCard'
import PageHeader from '../components/ui/PageHeader'
import TaskLinksCard from '../components/sections/TaskLinksCard'

/** 金币商城页 */
export default function ShopPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-14 pt-5 md:px-6 md:pt-7">
      <PageHeader
        seal="兑"
        title="金币商城"
        sub="你的努力值得被看见 —— 金币兑换对话次数或会员体验"
      />
      <ShopSection />
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_380px] lg:gap-[18px]">
        <TaskLinksCard />
        <MemberCard />
      </div>
    </div>
  )
}
