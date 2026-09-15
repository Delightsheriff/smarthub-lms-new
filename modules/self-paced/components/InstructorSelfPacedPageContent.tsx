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
        title="Self-paced courses"
        description="Share your referral links, see what they've sold, and track your share of every sale."
      />

      {!teaches ? (
        <EmptyState
          icon={GraduationCap}
          title="For instructors"
          description="Referral links and self-paced sales are available to accounts that teach on SmartHub."
        />
      ) : (
        <Tabs defaultValue="links">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="links">My referral links</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>
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
