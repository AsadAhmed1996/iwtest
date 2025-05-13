import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Meta {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface ApiResponse {
    data: User[];
    meta: Meta;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);

    const day = date.getDate();
    const dayWithSuffix =
        day +
        (day % 10 === 1 && day !== 11
            ? 'st'
            : day % 10 === 2 && day !== 12
            ? 'nd'
            : day % 10 === 3 && day !== 13
            ? 'rd'
            : 'th');

    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const year = date.toLocaleDateString('en-GB', { year: 'numeric' });

    return `${dayWithSuffix} ${month} ${year}`;
}

const IndexPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 });
    const [loading, setLoading] = useState<boolean>(false);
    const [goToPage, setGoToPage] = useState<string>('');
    const [goToPageError, setGoToPageError] = useState<string>('');
    const [perPage, setPerPage] = useState<number>(10);
    const [sortKey, setSortKey] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleSort = (key: string) => {
        if (key === sortKey) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const fetchUsers = async (page: number = 1, limit: number = 10, search: string = '') => {
        setLoading(true);
        try {
            const response = await axios.get<ApiResponse>(`/api/users?page=${page}&limit=${limit}&search=${search}`);
            setUsers(response.data.data);
            setMeta(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getFreshData = (page: number, limit: number, search: string) => {
        if (page >= 1 && page <= meta.last_page) {
            fetchUsers(page, limit, search);
        }
    };

    const getPaginationRange = () => {
        const range: number[] = [];
        const start = Math.max(meta.current_page - 2, 1);
        const end = Math.min(meta.current_page + 2, meta.last_page);

        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (sortKey === 'id') {
            return sortOrder === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
        } else if (sortKey === 'created_at') {
            return sortOrder === 'asc'
                ? new Date(a[sortKey]) - new Date(b[sortKey])
                : new Date(b[sortKey]) - new Date(a[sortKey]);
        } else {
            const aVal = a[sortKey]?.toString().toLowerCase() ?? '';
            const bVal = b[sortKey]?.toString().toLowerCase() ?? '';
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            getFreshData(1, perPage, searchTerm);
        }, 600);

        return () => clearTimeout(timeout);
    }, [searchTerm]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between mt-2">
                <div>
                    <h1 className="text-2xl font-semibold pt-1 mr-2">Users</h1>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Search by ID, name or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border px-3 py-2 rounded-md mb-4"
                    />
                    <button
                        className={searchTerm === '' ? 'hidden' : 'ml-2 cursor-pointer'}
                        onClick={() => setSearchTerm('')}
                    >
                        Clear
                    </button>
                </div>
            </div>

            <table className="table-auto w-full border">
                <thead>
                    <tr className="bg-green-500">
                        <th
                            className="border px-4 py-2 text-left"
                            onClick={() => handleSort('id')}
                        >
                            ID
                            <FontAwesomeIcon
                                icon={
                                    sortKey !== 'id'
                                    ? faSort
                                    : sortOrder === 'asc'
                                    ? faSortUp
                                    : faSortDown
                                }
                                className="ml-2 cursor-pointer"
                            />
                        </th>
                        <th
                            className="border px-4 py-2 text-left"
                            onClick={() => handleSort('name')}
                        >
                            Name
                            <FontAwesomeIcon
                                icon={
                                    sortKey !== 'name'
                                    ? faSort
                                    : sortOrder === 'asc'
                                    ? faSortUp
                                    : faSortDown
                                }
                                className="ml-2 cursor-pointer"
                            />
                        </th>
                        <th
                            className="border px-4 py-2 text-left"
                            onClick={() => handleSort('email')}
                        >
                            Email
                            <FontAwesomeIcon
                                icon={
                                    sortKey !== 'email'
                                    ? faSort
                                    : sortOrder === 'asc'
                                    ? faSortUp
                                    : faSortDown
                                }
                                className="ml-2 cursor-pointer"
                            />
                        </th>
                        <th
                            className="border px-4 py-2 text-left"
                            onClick={() => handleSort('created_at')}
                        >
                            Registration Date
                            <FontAwesomeIcon
                                icon={
                                    sortKey !== 'created_at'
                                    ? faSort
                                    : sortOrder === 'asc'
                                    ? faSortUp
                                    : faSortDown
                                }
                                className="ml-2 cursor-pointer"
                            />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="px-4 py-2 text-center" colSpan={4}>Loading...</td>
                        </tr>
                    ) : (
                        sortedUsers.map(user => (
                            <tr key={user.id} className="even:bg-green-400">
                                <td className="border px-4 py-2">{user.id}</td>
                                <td className="border px-4 py-2">{user.name}</td>
                                <td className="border px-4 py-2">{user.email}</td>
                                <td className="border px-4 py-2">{formatDate(user.created_at)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="flex flex-col items-center mt-6 sm:flex-row sm:justify-between">
                <div className="w-full sm:w-auto mb-2">
                    Page {meta.current_page} of {meta.last_page}

                </div>
                <div className="flex w-full sm:w-auto sm:justify-end gap-1">
                    <button
                        disabled={meta.current_page === 1}
                        onClick={() => getFreshData(1, perPage, searchTerm)}
                        className={
                            meta.current_page !== 1
                            ? 'p-2 cursor-pointer hover:bg-green-500 rounded-md'
                            : 'hidden'
                        }
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                        <FontAwesomeIcon icon={faChevronLeft} className={'mr-2'} />
                        First
                    </button>

                    <button
                        disabled={meta.current_page <= 1}
                        onClick={() => getFreshData(meta.current_page - 1, perPage, searchTerm)}
                        className={
                            meta.current_page > 1
                            ? 'p-2 cursor-pointer hover:bg-green-500 rounded-md'
                            : 'hidden'
                        }
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className={'mr-2'} />
                        Previous
                    </button>

                    {getPaginationRange().map(page => (
                        <button
                            key={page}
                            onClick={() => getFreshData(page, perPage, searchTerm)}
                            className={
                                page === meta.current_page
                                    ? 'px-4 py-2 cursor-pointer bg-green-400 rounded-md'
                                    : 'px-4 py-2 cursor-pointer hover:bg-green-400 rounded-md'
                            }
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => getFreshData(meta.current_page + 1, perPage, searchTerm)}
                        className={
                            meta.current_page < meta.last_page
                            ? 'p-2 cursor-pointer hover:bg-green-500 rounded-md'
                            : 'hidden'
                        }
                    >
                        Next
                        <FontAwesomeIcon icon={faChevronRight} className={'ml-2'} />
                    </button>

                    <button
                        onClick={() => getFreshData(meta.last_page, perPage, searchTerm)}
                        className={
                            meta.current_page < meta.last_page
                            ? 'p-2 cursor-pointer hover:bg-green-500 rounded-md'
                            : 'hidden'
                        }
                    >
                        Last
                        <FontAwesomeIcon icon={faChevronRight} className={'ml-2'} />
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-center mt-2 sm:flex-row sm:justify-between">
                <div className="w-full sm:w-auto mb-2">
                    {meta.from} to {meta.to} of {meta.total} users
                </div>
                <div className="flex w-full sm:w-auto sm:justify-end gap-2">
                    <label htmlFor="perPage">
                        Show:
                    </label>
                    <select
                        id="perPage"
                        value={perPage}
                        onChange={(e) => {
                            setPerPage(Number(e.target.value));
                            getFreshData(1, Number(e.target.value), searchTerm);
                        }}
                        className="border rounded-md px-2 py-1"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>

                    <label htmlFor="page">
                        Go to page:
                    </label>
                    <input
                        id="page"
                        type="number"
                        min="1"
                        max={meta.last_page}
                        value={goToPage}
                        onChange={(e) => setGoToPage(e.target.value)}
                        className="w-20 border rounded-md px-2 py-1 text-center"
                    />
                    <button
                        onClick={() => {
                            const page = parseInt(goToPage);
                            if (!isNaN(page) && page >= 1 && page <= meta.last_page) {
                                getFreshData(page, perPage, searchTerm);
                                setGoToPage('');
                                setGoToPageError('');
                            } else {
                                setGoToPageError(`Enter a number between 1 and ${meta.last_page}`);
                            }
                        }}
                        className="cursor-pointer px-4 py-1 rounded-md bg-green-500 hover:bg-green-400"
                    >
                        Go
                    </button>
                    {goToPageError && (
                        <div className="text-red-500 text-sm mt-1">
                            {goToPageError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IndexPage;