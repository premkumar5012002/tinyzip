import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, ChevronLeft, Folder } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface FileBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  setCurrentFolderId: (id: string | null) => void;
}

export function FileBreadcrumbs({
  breadcrumbs,
  setCurrentFolderId,
}: FileBreadcrumbsProps) {
  const handleBackClick = () => {
    if (breadcrumbs.length <= 1) {
      setCurrentFolderId(null); // Go to Home
    } else {
      setCurrentFolderId(breadcrumbs[breadcrumbs.length - 2].id); // Go to parent folder
    }
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1.5">
              <Folder className="size-4" />
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((b, index) => (
          <React.Fragment key={b.id}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/folder/${b.id}`}
                  className="flex items-center gap-1.5"
                >
                  <Folder className="size-4" />
                  {b.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
