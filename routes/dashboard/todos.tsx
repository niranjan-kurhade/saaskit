import type { Handlers, PageProps } from "$fresh/server.ts";
import { getTodos, type Todo } from "@/utils/todos.ts";
import { stripe } from "@/utils/stripe.ts";
import Head from "@/components/Head.tsx";
import TodoList from "@/islands/TodoList.tsx";
import Notice from "@/components/Notice.tsx";
import { DashboardState } from "./_middleware.ts";
import Dashboard from "@/components/Dashboard.tsx";
import { createSupabaseClient } from "../../utils/supabase.ts";

interface Data {
  subscribed: boolean;
  todos: Todo[];
}

export const handler: Handlers<Data, DashboardState> = {
  async GET(request, ctx) {
    const { user } = ctx.state.session;
    const { data: [subscription] } = await stripe.subscriptions.list({
      customer: user.user_metadata.stripe_customer_id,
    });

    return await ctx.render({
      subscribed: Boolean(subscription),
      todos: await getTodos(createSupabaseClient(request.headers)),
    });
  },
};

export default function TodosPage(props: PageProps<Data>) {
  return (
    <>
      <Head title="Todos" />
      <Dashboard active="/dashboard/todos">
        {!props.data.subscribed && (
          <Notice
            color="yellow"
            message={
              <span>
                You are on a free subscription. Please{" "}
                <a href="/dashboard/upgrade-subscription" class="underline">
                  upgrade
                </a>{" "}
                to enable unlimited todos
              </span>
            }
          />
        )}
        <TodoList
          subscribed={props.data.subscribed}
          todos={props.data.todos}
        />
      </Dashboard>
    </>
  );
}