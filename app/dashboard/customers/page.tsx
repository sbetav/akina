import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PlusIcon, SearchIcon, UsersIcon } from "lucide-react";
import { FC } from "react";

const Page: FC = () => {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Clientes</PageHeaderTitle>
          <PageHeaderDescription>// Gestión de terceros</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button size="lg">
            <PlusIcon />
            Nuevo cliente
          </Button>
        </PageHeaderActions>
      </PageHeader>
      <InputGroup>
        <InputGroupInput placeholder="Buscar por nombre o número de documento..." />
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>

      <Empty fillSpace>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>Sin clientes aún</EmptyTitle>
          <EmptyDescription className="max-w-[300px]">
            Crea tu primer cliente para empezar a emitir documentos.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg">
            <PlusIcon />
            Nuevo cliente
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
};

export default Page;
