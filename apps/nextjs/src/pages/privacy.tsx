import Head from 'next/head';
import React from 'react';

const PrivacyPolicy = () => {
	return (
		<>
			<Head>
				<title>Privacy Policy - Sakpa</title>
			</Head>
			<div className="max-w-3xl mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
				<p className="mb-4">
					At Sakpa, we value the privacy of our users and are committed to protecting it. This
					Privacy Policy explains how we collect, use, and disclose information when you use our
					website and services.
				</p>
				<h2 className="text-2xl font-bold mt-8 mb-4">Information Collection</h2>
				<p className="mb-4">
					We may collect personal information such as your name, email address, and contact details
					when you voluntarily provide them to us through our website or services.
				</p>
				<h2 className="text-2xl font-bold mt-8 mb-4">Information Usage</h2>
				<p className="mb-4">
					The personal information we collect may be used to provide and improve our services, send
					you notifications and updates, respond to inquiries and customer support requests, and
					personalize your experience on our website.
				</p>
				<h2 className="text-2xl font-bold mt-8 mb-4">Information Sharing</h2>
				<p className="mb-4">
					We may share your personal information with trusted third parties who assist us in
					operating our website, conducting our business, and providing services to you. However, we
					will not sell, trade, or transfer your personal information to outside parties without
					your consent, except as required by law or as necessary to fulfill our service
					obligations.
				</p>
				<h2 className="text-2xl font-bold mt-8 mb-4">Security</h2>
				<p className="mb-4">
					We implement reasonable security measures to protect your personal information. However,
					please understand that no method of transmission over the internet or electronic storage
					is 100% secure, and we cannot guarantee absolute security.
				</p>
				<h2 className="text-2xl font-bold mt-8 mb-4">Changes to the Privacy Policy</h2>
				<p className="mb-4">
					We reserve the right to modify this Privacy Policy at any time. Any changes will be
					effective upon posting the updated Privacy Policy on our website. We encourage you to
					review this Privacy Policy periodically for any changes.
				</p>
				<h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
				<p className="mb-4">
					If you have any questions or concerns about our Privacy Policy, please contact us at
					privacy@sakpa.co.
				</p>
			</div>
		</>
	);
};

export default PrivacyPolicy;
