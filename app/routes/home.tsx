import apiClient from "~/api/apiClient";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
	const response = await apiClient.get('/api/public/status/page/settings');
  console.log("===>Response", response);


	return {
		statusPage: response,
	};
}

export default function Home() {
  return <div>
  <h1 className='text-2xl'>Welcome to React</h1>
  Welcome to React
  <button onClick={async () => console.log('Home')}>Home</button>
</div>
}
