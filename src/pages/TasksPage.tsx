import SignInCard from '../components/sections/SignInCard'
import TasksSection from '../components/sections/TasksSection'
import PageHeader from '../components/ui/PageHeader'

/** 任务中心页：签到 + 每日任务 */
export default function TasksPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-14 pt-5 md:px-6 md:pt-7">
      <PageHeader
        seal="任"
        title="任务中心"
        sub="签到领金币、做任务赚奖励，金币可去商城兑换对话次数与会员"
      />
      <div className="grid items-start gap-4 lg:grid-cols-[380px_1fr] lg:gap-[18px]">
        <SignInCard />
        <TasksSection />
      </div>
    </div>
  )
}
