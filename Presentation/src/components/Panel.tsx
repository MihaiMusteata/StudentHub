import { FC, useState } from 'react';

interface PanelProps {
    setIsAddModalOpen: (isAddModalOpen: boolean) => void;
    columns: string[];
    data: { [key: string]: string | number }[];
    title: string;
    onEdit?: (id: string) => void;
    onDelete: (id: string) => void;
    onInfo?: (id: string) => void;
}


const Panel: FC<PanelProps> = ({ setIsAddModalOpen, columns, data, title, onEdit, onDelete, onInfo }) => {
    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                    <div className="card my-4">
                        <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                            <div className="d-flex justify-content-between align-items-center bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3 px-3">
                                <h6 className="text-white text-capitalize mb-0">{title}</h6>
                                <button className="btn bg-gradient-warning btn-sm mb-0 shadow" onClick={() => setIsAddModalOpen(true)}>Add</button>
                            </div>
                        </div>
                        <div className="card-body px-0 pb-2">
                            <div className="table-responsive p-0">
                                <table className="table align-items-center mb-0">
                                    <thead>
                                        <tr>
                                            {columns.map((column, index) => (
                                                <th key={index} className="text-secondary opacity-7 align-middle text-center">{column}</th>
                                            ))}
                                            <th className="text-secondary text-center opacity-7">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, index) => (
                                            <tr key={index} >
                                                {Object.entries(row).map(([key, value], i) => (
                                                    <td key={i} className='align-middle text-center'>{key === 'id' ? <AbbreviatedId id={String(value)} /> : value}</td>
                                                ))}
                                                <td className='d-flex justify-content-center align-middle  align-items-center text-center'>
                                                    {onEdit &&
                                                        <button className="btn bg-gradient-primary btn-sm mb-0" onClick={() => onEdit(String(row.id))} style={{ display: 'flex', alignItems: 'center' }}>Edit</button>
                                                    }
                                                    {onInfo &&
                                                        <button className="btn bg-gradient-info btn-sm ms-2 mb-0" onClick={() => onInfo(String(row.id))} style={{ display: 'flex', alignItems: 'center' }}>Info</button>
                                                    }
                                                    <button className="btn bg-gradient-danger btn-sm ms-2 mb-0" onClick={() => onDelete(String(row.id))} style={{ display: 'flex', alignItems: 'center' }}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
interface AbbreviatedIdProps {
    id: string;
}

const AbbreviatedId: FC<AbbreviatedIdProps> = ({ id }) => {
    const [expanded, setExpanded] = useState(false);
    const handleClick = () => {
        setExpanded(!expanded);
    };

    return (
        <span onClick={handleClick} style={{ cursor: 'pointer' }}>
            {id !== undefined ? (
                expanded ? id :
                    id.length > 8 ? `${id.substring(0, 4)}...${id.substring(id.length - 4)}` : id
            ) : 'ID not available'}
        </span>
    );
};

export default Panel;
