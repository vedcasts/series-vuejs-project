
/**
* Vue filter estará a disposição no HTML. Exemplo:
* <p>{{ cervejaria.last_mod | dateFormat }}</p>
* Documentação oficial sobre filters: http://vuejs.org/guide/filters.html
*/
Vue.filter('dateFormat', function(value, formatString)
{
    if(formatString != undefined)
    {
        return moment(value).format(formatString);
    }
    return moment(value).format('DD/MM/YYYY');
});

new Vue({

    /**
    * Element HTML que será gerenciado
    */
    el: '#beerApp',

    /**
    * Todas as propriedades deste objeto estará disponíveis
    * no HTML de ID beerApp e seus filhos. Qualquer mudança
    * nos valores do objeto será refletida no HTML.
    */
    data: {
        cervejaria: {
            name: '',
            city: '',
            state: '',
            country: '',
            descript: ''
        },
        cervejarias: {
            all: [],
            list: [],
            paginated: []
        },
        pagination: {
            perPage: 8,
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            pageNumbers: []
        },
        interaction: {
            visibleColumns: ['name', 'last_mod'],
            columnsToFilter: [],
            filterTerm: '',
            openDetails: [],
            sortColumn: 'name',
            sortInverse: 0,
        },
        controls: {
            select2: null,
        }
    },

    /**
    * Os métodos abaixo estarão disponíveis no HTML
    * de ID beerApp e seus filhos
    */
    methods: {

        edit: function(ev, cervejaria)
        {
            ev.preventDefault();

            Vue.set(this, 'cervejaria', cervejaria);

            jQuery(this.$els.modal).modal('show');
        },

        save: function(ev)
        {
            ev.preventDefault();

            // this.$http.post('url do servico', cervejaria, function(response)
            // {

            // });

            jQuery(this.$els.modal).modal('hide');
            window.alert('Cervejaria salva, seu bebum!');
            window.console.log(JSON.stringify(this.cervejaria));
        },

        new: function()
        {
            this.cervejaria.name = '';
            this.cervejaria.city = '';
            this.cervejaria.state = '';
            this.cervejaria.country = '';
            this.cervejaria.descript = '';

            jQuery(this.$els.modal).modal('show');
        },

        setPaginationData: function(list)
        {
            var self = this,
            chunk    = _.chunk(list, self.pagination.perPage);

            Vue.set(self.cervejarias, 'paginated', chunk);
            Vue.set(self.cervejarias, 'list', chunk[0]);

            Vue.set(self.pagination, 'currentPage', 1);
            Vue.set(self.pagination, 'totalItems', list.length);
            Vue.set(self.pagination, 'totalPages', Math.ceil(list.length / self.pagination.perPage));
            Vue.set(self.pagination, 'pageNumbers', _.range(1, self.pagination.totalPages+1));
        },

        page: function(ev, page)
        {
            ev.preventDefault();

            var self = this;

            Vue.set(self.pagination, 'currentPage', page);

            Vue.set(self.cervejarias, 'list', self.cervejarias.paginated[page-1]);
        },

        next: function(ev)
        {
            ev.preventDefault();

            var self = this;

            if(self.pagination.currentPage == self.pagination.totalPages)
            {
                return false;
            }

            Vue.set(self.pagination, 'currentPage', self.pagination.currentPage+1);

            Vue.set(self.cervejarias, 'list', self.cervejarias.paginated[self.pagination.currentPage-1]);
        },

        previous: function(ev)
        {
            ev.preventDefault();

            var self = this;

            if(self.pagination.currentPage == 1)
            {
                return false;
            }

            Vue.set(self.pagination, 'currentPage', self.pagination.currentPage-1);

            Vue.set(self.cervejarias, 'list', self.cervejarias.paginated[self.pagination.currentPage-1]);
        },

        doResetAll: function()
        {
            var self = this;

            Vue.set(self.interaction, 'visibleColumns', ['name', 'last_mod']);
            Vue.set(self.interaction, 'columnsToFilter', []);
            Vue.set(self.interaction, 'filterTerm', '');
            Vue.set(self.interaction, 'openDetails', []);
            Vue.set(self.interaction, 'sortColumn', 'name');
            Vue.set(self.interaction, 'sortInverse', 0);

            self.setPaginationData(self.cervejarias.all);

            self.controls.select2.val('').trigger('change');
        },

        doFilter: function()
        {
            var self = this,
            filtered = self.cervejarias.all;

            if(self.interaction.filterTerm != '' && self.interaction.columnsToFilter.length > 0)
            {
                filtered = _.filter(self.cervejarias.all, function(cervejaria)
                {
                    return self.interaction.columnsToFilter.some(function(column)
                    {
                        return cervejaria[column].toLowerCase().indexOf(self.interaction.filterTerm.toLowerCase()) > -1
                    });
                });
            }

            self.setPaginationData(filtered);
        },

        doSort: function(ev, column)
        {
            ev.preventDefault();

            var self = this;

            self.interaction.sortColumn = column;

            if(self.interaction.sortInverse == 0)
            {
                Vue.set(self.interaction, 'sortInverse', -1);
            } else {
                Vue.set(self.interaction, 'sortInverse', 0);
            }
        },

        doOpenDetails: function(ev, id)
        {
            ev.preventDefault();

            var self = this,

                index = self.interaction.openDetails.indexOf(id);

            if(index > -1)
            {
                self.interaction.openDetails.$remove(id);
            } else {
                self.interaction.openDetails.push(id);
            }
        },

        openAllDetails: function(ev)
        {
            ev.preventDefault();

            var self = this;

            if(self.interaction.openDetails.length > 0)
            {
                Vue.set(self.interaction, 'openDetails', []);
            } else {
                Vue.set(self.interaction, 'openDetails', _.pluck(self.cervejarias.list, 'id'));
            }
        }
    },

    /**
    * Este método será executado assim que tanto o Vue quanto
    * o HTML de ID beerApp (e seus filhos) estiverem prontos.
    */
    ready: function()
    {
        var self = this;

        /**
        * Para distribuição foi adicionado ao projeto o arquivo
        * cervejarias.json, contendo todos os dados necessários
        * para a aplicação funcionar corretamente. Não funciona
        * se você abrir a página index.html no browser utilizando
        * Ctrl (CMD) + o. É preciso um virtual host.
        * Solução: coloque o arquivo em algum de seus domínios para poder
        * usar abaixo: http://www.seudominio.com/cervejarias.json.
        */
        self.$http.get('/cervejarias.json', function(response)
        // self.$http.get('http://api.beer.app/cervejarias', function(response)
        {
            Vue.set(self.cervejarias, 'all', response);

            self.setPaginationData(response);
        });

        self.controls.select2 = jQuery(self.$els.columnsToFilterSelect).select2({
            placeholder: 'Selecionar uma ou mais colunas para filtrar!'
        }).on('change', function()
        {
            Vue.set(self.interaction, 'columnsToFilter', jQuery(this).val());
        });
    }
});