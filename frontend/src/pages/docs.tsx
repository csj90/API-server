import Header from '../components/header';
import Navbar from '../components/navbar/main';
import Link from 'next/link';
import type { Endpoint } from '../types/types';
import { useSession } from 'next-auth/react';

interface Props {
  endpoints: Array<Endpoint>
}

export default function Docs({ endpoints }: Props) {
	const { data: session, status } = useSession();
	if (status == 'loading') return null;

	return (
		<>
			<Header />
			<Navbar user={session?.user}/>
			<section className="vh-100" style={{ 'backgroundColor': '#eee', maxHeight: '94vh', overflowY: 'hidden' }}>
				<div className="container h-100">
					<div className="row d-flex justify-content-center align-items-center h-100">
						<div className="col-lg-11 col-xl-11">
							<div className="card text-black" style={{ 'borderRadius': '25px', minHeight: '75vh' }}>
								<div className="card-body p-md-5">
									<div className="row justify-content-center">
										<div className="col-md-12 col-lg-11 col-xl-11 order-2 order-lg-1">
											<div className="d-flex align-items-start">
												<div className="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
													<button className="nav-link active" id="v-pills-home-tab" data-bs-toggle="pill" data-bs-target="#v-pills-home" type="button" role="tab" aria-controls="v-pills-home" aria-selected="true">Introduction</button>
													<button className="nav-link" id="v-pills-profile-tab" data-bs-toggle="pill" data-bs-target="#v-pills-profile" type="button" role="tab" aria-controls="v-pills-profile" aria-selected="false">Authentication</button>
													<button className="nav-link" id="v-pills-messages-tab" data-bs-toggle="pill" data-bs-target="#v-pills-messages" type="button" role="tab" aria-controls="v-pills-messages" aria-selected="false">Errors</button>
													<button className="nav-link" id="v-pills-settings-tab" data-bs-toggle="pill" data-bs-target="#v-pills-settings" type="button" role="tab" aria-controls="v-pills-settings" aria-selected="false">Endpoints</button>
												</div>
												<div className="tab-content" id="v-pills-tabContent">
													<div className="tab-pane fade show active" id="v-pills-home" role="tabpanel" aria-labelledby="v-pills-home-tab">
														<h1>Introduction</h1>
														<hr />
														<h5>How do I get access?</h5>
														<p> Just login <Link href="/signIn">here</Link> and then navigate to your settings to get your API token.</p>
													</div>
													<div className="tab-pane fade" id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab">
														<h1>Authentication</h1>
														<hr />
														<p>If you don’t already have an API Key, you can get one by simply by going to your <Link href="/settings">settings</Link> page.</p>
														<h5>How to access the API:</h5>
														<ol>
															<li>On your browser, just <Link href="/signIn">login in</Link> and then access an <Link href="/random">API endpoint</Link>.</li>
															<li>Set your API Key as the Authorization header on every request:</li>
															<ul>
																<li>
																	<code>curl --header &quot;authorization: YOURTOKEN&quot; https://api.egglord.dev</code>
																</li>
															</ul>
															<li>Add your token to the end of the url:</li>
															<ul>
																<li>
																	<code>https://api.egglord.dev/misc/advice?token=YOURTOKEN</code>
																</li>
															</ul>
														</ol>
													</div>
													<div className="tab-pane fade" id="v-pills-messages" role="tabpanel" aria-labelledby="v-pills-messages-tab">
														<h1>Errors</h1>
														<hr />
														<p>Heres the list of all errors than the API can return with a request.</p>
														<table className="table">
															<thead>
																<tr>
																	<th scope="col">Status</th>
																	<th scope="col">Message</th>
																</tr>
															</thead>
															<tbody>
																{ [[200, 'OK'], [400, 'Bad Request'], [401, 'Unauthorized'], [403, 'Forbidden'], [404, 'Not Found'], [413, 'Payload Too Large'], [429, 'Too many requests'], [500, 'Internal Server Error'], [501, 'Not Implemented'], [502, 'Bad Gateway'], [503, 'Service Unavailable']].map(_ => (
																	<tr key={null}>
																		<th scope="row">{_.at(0)}</th>
																		<td>{_.at(1)}</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
													<div className="tab-pane fade" id="v-pills-settings" role="tabpanel" aria-labelledby="v-pills-settings-tab" style={{ maxHeight:'100%', overflowY: 'scroll' }}>
														<div className="accordion" id="accordionPanelsStayOpenExample">
															{endpoints?.map(e => (
																<div className="accordion-item" style={{ minWidth:'100%' }} key={e.description}>
																	<h2 className="accordion-header" id={`panelsStayOpen-heading${endpoints.indexOf(e)}`}>
																		<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#panelsStayOpen-collapse${endpoints.indexOf(e)}`} aria-expanded="true" aria-controls={`panelsStayOpen-collapse${endpoints.indexOf(e)}`}>
																			{e.endpoint.split('/').at(-1)}
																		</button>
																	</h2>
																	<div id={`panelsStayOpen-collapse${endpoints.indexOf(e)}`} className="accordion-collapse collapse show" aria-labelledby={`panelsStayOpen-heading${endpoints.indexOf(e)}`}>
																		<div className="accordion-body">
																			<div>
																				<h6>{e.description}. (Method: {e.method})</h6>
																				<h5>Parameters:</h5>
																				{e.parameters.length >= 1 ?
																					<table className="table">
																						<thead>
																							<tr>
																								<th scope="col">Name</th>
																								<th scope="col">Description</th>
																								<th scope="col">Required</th>
																								<th scope="col">Type</th>
																							</tr>
																						</thead>
																						<tbody>
																							{e.parameters.map(p => (
																								<tr key={e.parameters.indexOf(p)}>
																									<td>{p.name}</td>
																									<td>{p.description}</td>
																									<td>{p.required ? 'Yes' : 'No'}</td>
																									<td>{p.type}</td>
																								</tr>
																							))}
																						</tbody>
																					</table>
																					:
																					<p>No parameters required</p>
																				}
																				<h5>Responses</h5>
																				<p>Coming soon!!</p>
																			</div>
																		</div>
																	</div>
																</div>
															))}
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

// Fetch endpoints
export async function getServerSideProps() {
	return { props: { endpoints: [
		{
			endpoint: '/admin/user',
			method: 'PATCH',
			description: 'Update a users information',
			tag: 'info',
			responses: [],
			parameters: [],
		},
		{
			endpoint: '/admin/endpoint',
			method: 'PATCH',
			description: 'Update a users information',
			tag: 'info',
			responses: [],
			parameters: [],
		},
		{
			endpoint: '/games/fortnite',
			method: 'GET',
			description: 'Get information on a fortnite player',
			tag: 'games',
			responses: [],
			parameters: [],
		},
	] } };
}

