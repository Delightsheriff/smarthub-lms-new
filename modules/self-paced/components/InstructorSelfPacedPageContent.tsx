"use client";
import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useTeachesInLms } from "../api/instructor.queries";
import { InstructorAttributedSales } from "./InstructorAttributedSales";
import { InstructorReferralLinks } from "./InstructorReferralLinks";
import { InstructorSelfPacedEarnings } from "./InstructorSelfPacedEarnings";

/**
 * The instructor's self-paced surface: referral links for the courses
 * they're named on, the sales those links produced, and their revenue
 * share across all self-paced sales of their courses.
 */
export function InstructorSelfPacedPageContent() {
  const teaches = useTeachesInLms();

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        eyebrow="Teaching"
        title="Self-paced Courses"
        dateline="Instructor Revenue & Attribution"
        divider
        description="Share your personal course links, monitor attributed sales, and track your revenue shares."
      />

      {!teaches ? (
        <EmptyState
          icon={GraduationCap}
          title="For instructors"
          description="Referral links and self-paced sales are available to accounts that teach on SmartHub."
        />
      ) : (
        <Tabs defaultValue="links" className="space-y-4">
          <div className="overflow-x-auto pb-1 max-w-full -mx-1 px-1">
            <TabsList className="w-max">
              <TabsTrigger value="links">My referral links</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="links" className="mt-4">
            <InstructorReferralLinks />
          </TabsContent>
          <TabsContent value="sales" className="mt-4">
            <InstructorAttributedSales />
          </TabsContent>
          <TabsContent value="earnings" className="mt-4">
            <InstructorSelfPacedEarnings />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
