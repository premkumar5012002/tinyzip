import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Folder } from "lucide-react";
import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface FileBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
}

export function FileBreadcrumbs({ breadcrumbs }: FileBreadcrumbsProps) {
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

        {breadcrumbs.map((b) => (
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
