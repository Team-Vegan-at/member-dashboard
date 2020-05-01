import React, { Component } from 'react';

import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';

import { MembersService } from '../services/MembersService';

export class Dashboard extends Component {

    constructor() {
        super();
        this.state = {};
        this.service = new MembersService();
        this.export = this.export.bind(this);
    }

    componentDidMount() {
        this.service.getMembers().then(data => this.setState({members: data}));
    }

    export() {
        this.dt.exportCSV();
    }

    render() {
        let header = <div style={{textAlign:'left'}}>
                        <Button type="button" icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}/>
                    </div>;

        let headerGroup = <ColumnGroup>
                            <Row>
                                <Column header="name" rowSpan={2} sortable="true" />
                                <Column header="email" rowSpan={2} sortable="true" />
                                <Column header="forum" colSpan={2} />
                            </Row>
                            <Row>
                                <Column header="username" />
                                <Column header="active" />
                            </Row>
                        </ColumnGroup>;

        return (
            <DataTable 
                value={this.state.members}
                header={header}
                headerColumnGroup={headerGroup}
                ref={(el) => { this.dt = el; }}>
                <Column field="name" />
                <Column field="email" />
                <Column field="discourse.username" />
                <Column field="discourse.active" />
            </DataTable>
        );
    }
}
