import { useRouter } from 'next/router';
import { NextPage } from 'next/types';
import React, { MouseEvent } from 'react';

const ChatSp: NextPage = () => {
	const router = useRouter();
	const { id } = router.query;

	return <>{id}</>;
};

export default ChatSp;
