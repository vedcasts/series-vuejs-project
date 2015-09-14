
Vue.filter('dateFormat', function(value, formatString)
{
    if(formatString != undefined)
    {
        return moment(value).format(formatString);
    }
    return moment(value).format('DD/MM/YYYY');
});

new Vue({

    el: '#beerApp',

    data: {
        select2: null,
        visibleColumns: ['name', 'last_mod'],
        columnsToFilter: [],
        filterTerm: '',
        all: [],
        cervejarias: [],
        openDetails: [],
        sortColumn: 'name',
        sortInverse: false,
    },

    methods: {

        doResetAll: function()
        {
            var self = this;

            self.$set('visibleColumns', ['name', 'last_mod']);
            self.$set('columnsToFilter', []);
            self.$set('filterTerm', '');
            self.$set('cervejarias', self.all);
            self.$set('openDetails', []);
            self.$set('sortColumn', 'name');
            self.$set('sortInverse', false);

            self.select2.val('').trigger('change');
        },

        doFilter: function()
        {
            var self = this,
            filtered = self.all;

            if(self.filterTerm != '' && self.columnsToFilter.length > 0)
            {
                filtered = _.filter(self.all, function(cervejaria)
                {
                    return self.columnsToFilter.some(function(column)
                    {
                        return cervejaria[column].toLowerCase().indexOf(self.filterTerm.toLowerCase()) > -1
                    });
                });
            }

            self.$set('cervejarias', filtered);
        },

        doSort: function(ev, column)
        {
            ev.preventDefault();

            var self = this;

            self.sortColumn = column;

            self.$set('sortInverse', !self.sortInverse);
        },

        doOpenDetails: function(ev, id)
        {
            ev.preventDefault();

            var self = this,

                index = self.openDetails.indexOf(id);

            if(index > -1)
            {
                self.openDetails.$remove(index);
            } else {
                self.openDetails.push(id);
            }
        },

        openAllDetails: function(ev)
        {
            ev.preventDefault();

            var self = this;

            if(self.openDetails.length > 0)
            {
                self.$set('openDetails', []);
            } else {
                self.$set('openDetails', _.pluck(self.cervejarias, 'id'));
            }
        }
    },

    ready: function()
    {
        var self = this;

        self.$http.get('http://api.beer.app/cervejarias', function(response)
        {
            self.$set('cervejarias', response);
            self.$set('all', response);
        });

        self.select2 = jQuery(self.$$.columnsToFilterSelect).select2({
            placeholder: 'Selecionar uma ou mais colunas para filtrar!'
        }).on('change', function()
        {
            self.$set('columnsToFilter', jQuery(this).val());
        });
    }
});