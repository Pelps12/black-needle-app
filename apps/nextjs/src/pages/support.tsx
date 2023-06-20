import React from 'react';

const SupportPage = () => {
	return (
		<main className="container mx-auto px-4 py-8">
			<div className=" rounded  p-6">
				<h1 className="text-2xl font-bold mb-4">Support</h1>
				<p className="text-gray-600 mb-4">
					Welcome to the support page! If you have any questions or need assistance, please feel
					free to contact us using the information below.
				</p>

				<h2 className="text-xl font-bold mb-2">Contact Information</h2>
				<p className="text-gray-600 mb-2">Email: support@sakpa.co</p>
				<p className="text-gray-600 mb-6">Phone: +1 832-688-3860</p>

				<h2 className="text-xl font-bold mb-2">Frequently Asked Questions</h2>
				<ul className="list-disc list-inside">
					<li className="text-gray-600 mb-2">How do I create an account?</li>
					<li className="text-gray-600 mb-2">What payment methods do you accept?</li>
					<li className="text-gray-600 mb-2">How can I update my profile information?</li>
					<li className="text-gray-600 mb-2">Is there a mobile app available?</li>
				</ul>
			</div>
		</main>
	);
};

export default SupportPage;
